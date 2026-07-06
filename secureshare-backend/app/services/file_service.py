from fastapi import Request
from app.aws.s3_client import s3_client
from app.core.config import settings
from app.core.exceptions import bad_request, forbidden, not_found
from app.repositories.download_repository import DownloadRepository
from app.repositories.item_repository import ItemRepository
from app.repositories.user_repository import UserRepository
from app.services.activity_service import ActivityService
from app.utils.datetime_utils import utc_now_iso
from app.utils.file_utils import get_extension, normalize_name, sanitize_filename
from app.utils.id_generator import new_id


class FileService:
    def __init__(self):
        self.s3 = s3_client()
        self.items = ItemRepository()
        self.users = UserRepository()
        self.downloads = DownloadRepository()
        self.activity = ActivityService()

    def list_items(self, owner_id: str, folder_id: str = 'root', search: str = '', sort: str = 'updatedAt_desc') -> list[dict]:
        items = self.items.list_items(owner_id, folder_id, 'ACTIVE')
        if search:
            q = search.lower().strip()
            items = [item for item in items if q in item.get('name', '').lower()]
        if sort == 'name_asc':
            items.sort(key=lambda x: x.get('normalizedName', ''))
        elif sort == 'size_desc':
            items.sort(key=lambda x: x.get('fileSizeBytes', 0), reverse=True)
        else:
            items.sort(key=lambda x: x.get('updatedAt', x.get('createdAt', '')), reverse=True)
        return items

    def create_upload_url(self, owner: dict, file_name: str, file_size: int, mime_type: str, parent_folder_id: str) -> dict:
        if file_size <= 0:
            raise bad_request('File size must be greater than 0')
        if owner.get('storageUsedBytes', 0) + file_size > owner.get('storageLimitBytes', settings.default_storage_limit_bytes):
            raise bad_request('Storage limit exceeded')

        file_id = new_id('file')
        safe_name = sanitize_filename(file_name)
        s3_key = f'users/{owner["userId"]}/files/{file_id}/{safe_name}'
        now = utc_now_iso()
        item = {
            'ownerId': owner['userId'],
            'itemId': file_id,
            'itemType': 'FILE',
            'parentFolderId': parent_folder_id,
            'name': safe_name,
            'normalizedName': normalize_name(safe_name),
            's3Key': s3_key,
            'fileSizeBytes': file_size,
            'mimeType': mime_type or 'application/octet-stream',
            'extension': get_extension(safe_name),
            'isFavorite': False,
            'status': 'UPLOADING',
            'downloadCount': 0,
            'viewCount': 0,
            'lastDownloadedAt': None,
            'createdAt': now,
            'updatedAt': now,
        }
        self.items.put_item(item)
        upload_url = self.s3.generate_presigned_url(
            ClientMethod='put_object',
            Params={'Bucket': settings.s3_bucket_name, 'Key': s3_key, 'ContentType': item['mimeType']},
            ExpiresIn=settings.s3_presigned_url_expires_seconds,
        )
        return {'fileId': file_id, 'uploadId': new_id('upload'), 's3Key': s3_key, 'uploadUrl': upload_url}

    def complete_upload(self, owner_id: str, file_id: str, s3_key: str, request: Request | None = None) -> dict:
        item = self._get_owned_file(owner_id, file_id, allow_uploading=True)
        if item['s3Key'] != s3_key:
            raise forbidden('Invalid S3 key for this file')
        now = utc_now_iso()
        updated = self.items.update_item_for_owner(owner_id, file_id, {'status': 'ACTIVE', 'updatedAt': now})
        # Keep user storage counters updated after the S3 upload is confirmed.
        # Dashboard also calculates directly from active file metadata, so it remains correct even if counters drift.
        try:
            self.users.add_storage_usage(owner_id, int(item.get('fileSizeBytes', 0)))
        except Exception:
            self.users.update_user(owner_id, {'updatedAt': now})
        self.activity.log(owner_id, 'UPLOAD', request, itemId=file_id, details=f'Uploaded {item["name"]}')
        return {'message': 'Upload completed', 'file': updated}

    def get_download_url(self, owner_id: str, file_id: str, request: Request | None = None) -> dict:
        item = self._get_owned_file(owner_id, file_id)
        download_url = self.s3.generate_presigned_url(
            ClientMethod='get_object',
            Params={'Bucket': settings.s3_bucket_name, 'Key': item['s3Key'], 'ResponseContentDisposition': f'attachment; filename="{item["name"]}"'},
            ExpiresIn=settings.s3_presigned_url_expires_seconds,
        )
        now = utc_now_iso()
        self.items.update_item_for_owner(owner_id, file_id, {'downloadCount': item.get('downloadCount', 0) + 1, 'lastDownloadedAt': now, 'updatedAt': now})
        self._record_download(item, None, request, 'OWNER_DOWNLOAD')
        self.activity.log(owner_id, 'DOWNLOAD', request, itemId=file_id, details=f'Downloaded {item["name"]}')
        return {'downloadUrl': download_url}

    def rename_file(self, owner_id: str, file_id: str, name: str) -> dict:
        self._get_owned_file(owner_id, file_id)
        now = utc_now_iso()
        return self.items.update_item_for_owner(owner_id, file_id, {'name': sanitize_filename(name), 'normalizedName': normalize_name(name), 'updatedAt': now})

    def soft_delete(self, owner_id: str, item_id: str) -> dict:
        item = self.items.get_item_for_owner(owner_id, item_id)
        if not item or item.get('status') == 'DELETED':
            raise not_found('Item not found')
        now = utc_now_iso()
        return self.items.update_item_for_owner(owner_id, item_id, {'status': 'TRASHED', 'trashedAt': now, 'updatedAt': now})

    def restore(self, owner_id: str, item_id: str) -> dict:
        item = self.items.get_item_for_owner(owner_id, item_id)
        if not item or item.get('status') != 'TRASHED':
            raise not_found('Trash item not found')
        now = utc_now_iso()
        return self.items.update_item_for_owner(owner_id, item_id, {'status': 'ACTIVE', 'updatedAt': now})

    def permanently_delete(self, owner_id: str, item_id: str) -> dict:
        item = self.items.get_item_for_owner(owner_id, item_id)
        if not item:
            raise not_found('Item not found')
        if item.get('itemType') == 'FILE' and item.get('s3Key'):
            try:
                self.s3.delete_object(Bucket=settings.s3_bucket_name, Key=item['s3Key'])
            except Exception:
                pass
        now = utc_now_iso()
        updated = self.items.update_item_for_owner(owner_id, item_id, {'status': 'DELETED', 'updatedAt': now})
        return {'message': 'Item permanently deleted', 'item': updated}

    def favorite(self, owner_id: str, file_id: str, value: bool) -> dict:
        self._get_owned_file(owner_id, file_id, allow_folder=True)
        return self.items.update_item_for_owner(owner_id, file_id, {'isFavorite': value, 'updatedAt': utc_now_iso()})

    def move(self, owner_id: str, file_id: str, target_folder_id: str) -> dict:
        self._get_owned_file(owner_id, file_id, allow_folder=True)
        return self.items.update_item_for_owner(owner_id, file_id, {'parentFolderId': target_folder_id, 'updatedAt': utc_now_iso()})

    def copy(self, owner_id: str, file_id: str, target_folder_id: str) -> dict:
        item = self._get_owned_file(owner_id, file_id)
        new_file_id = new_id('file')
        new_key = f'users/{owner_id}/files/{new_file_id}/{item["name"]}'
        self.s3.copy_object(Bucket=settings.s3_bucket_name, CopySource={'Bucket': settings.s3_bucket_name, 'Key': item['s3Key']}, Key=new_key)
        now = utc_now_iso()
        new_item = {**item, 'itemId': new_file_id, 'parentFolderId': target_folder_id, 's3Key': new_key, 'name': f'Copy of {item["name"]}', 'downloadCount': 0, 'viewCount': 0, 'createdAt': now, 'updatedAt': now}
        return self.items.put_item(new_item)

    def list_trash(self, owner_id: str) -> list[dict]:
        return self.items.list_trash(owner_id)

    def recent_uploads(self, owner_id: str) -> list[dict]:
        items = [i for i in self.items.list_all_active(owner_id) if i.get('itemType') == 'FILE']
        return sorted(items, key=lambda x: x.get('createdAt', ''), reverse=True)[:10]

    def _get_owned_file(self, owner_id: str, file_id: str, allow_folder: bool = False, allow_uploading: bool = False) -> dict:
        item = self.items.get_item_for_owner(owner_id, file_id)
        if not item:
            raise not_found('File not found')
        if not allow_folder and item.get('itemType') != 'FILE':
            raise bad_request('Item is not a file')
        allowed_statuses = ['ACTIVE']
        if allow_uploading:
            allowed_statuses.append('UPLOADING')
        if item.get('status') not in allowed_statuses:
            raise not_found('File not available')
        return item

    def _record_download(self, item: dict, share_id: str | None, request: Request | None, status: str) -> dict:
        event_id = new_id('dl')
        now = utc_now_iso()
        event = {
            'fileId': item['itemId'],
            'downloadedAtEventId': f'{now}#{event_id}',
            'eventId': event_id,
            'ownerId': item['ownerId'],
            'shareId': share_id,
            'fileName': item['name'],
            'downloadedAt': now,
            'ipAddress': request.client.host if request and request.client else None,
            'userAgent': request.headers.get('user-agent') if request else None,
            'downloadStatus': status,
        }
        return self.downloads.put_item(event)
