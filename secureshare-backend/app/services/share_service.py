from fastapi import Request
from app.aws.s3_client import s3_client
from app.core.config import settings
from app.core.exceptions import bad_request, forbidden, not_found
from app.repositories.item_repository import ItemRepository
from app.repositories.share_repository import ShareRepository
from app.repositories.user_repository import UserRepository
from app.services.activity_service import ActivityService
from app.services.notification_service import NotificationService
from app.utils.datetime_utils import add_minutes_iso, is_past, utc_now_iso
from app.utils.id_generator import new_id
from app.utils.password_utils import hash_password, verify_password


class ShareService:
    def __init__(self):
        self.shares = ShareRepository()
        self.items = ItemRepository()
        self.users = UserRepository()
        self.s3 = s3_client()
        self.activity = ActivityService()
        self.notifications = NotificationService()

    def create_share_link(self, owner: dict, file_id: str, expires_in_minutes: int, is_one_time: bool, visibility: str, password: str | None, request: Request | None = None) -> dict:
        file = self.items.get_item_for_owner(owner['userId'], file_id)
        if not file or file.get('itemType') != 'FILE' or file.get('status') != 'ACTIVE':
            raise not_found('File not found')
        share_id = new_id('share')
        now = utc_now_iso()
        share_url = f'{settings.frontend_public_url}/s/{share_id}'
        item = {
            'shareId': share_id,
            'fileId': file_id,
            'fileName': file['name'],
            'ownerId': owner['userId'],
            'ownerEmail': owner.get('email'),
            'shareToken': share_id,
            'shareUrl': share_url,
            'visibility': visibility,
            'expiresAt': add_minutes_iso(expires_in_minutes),
            'isOneTime': is_one_time,
            'maxDownloads': 1 if is_one_time else 0,
            'downloadCount': 0,
            'isUsed': False,
            'hasPassword': bool(password),
            'status': 'ACTIVE',
            'createdAt': now,
            'updatedAt': now,
            'lastAccessedAt': None,
        }
        if password:
            item.update(hash_password(password))
        self.shares.put_item(item)
        self.activity.log(owner['userId'], 'SHARE', request, itemId=file_id, shareId=share_id, details=f'Shared {file["name"]}')
        self.notifications.file_shared(file['name'], share_url, owner.get('email'))
        public_item = self._public_share_item(item)
        return {'message': 'Share link created', 'share': public_item, 'shareUrl': share_url}

    def list_shares(self, owner_id: str) -> list[dict]:
        return [self._public_share_item(s) for s in self.shares.list_by_owner(owner_id)]

    def get_owner_share(self, owner_id: str, share_id: str) -> dict:
        share = self.shares.get_share(share_id)
        if not share or share.get('ownerId') != owner_id:
            raise not_found('Share link not found')
        return self._public_share_item(share)

    def revoke(self, owner_id: str, share_id: str) -> dict:
        share = self.shares.get_share(share_id)
        if not share or share.get('ownerId') != owner_id:
            raise not_found('Share link not found')
        updated = self.shares.update_share(share_id, {'status': 'REVOKED', 'updatedAt': utc_now_iso()})
        return {'message': 'Share link revoked', 'share': self._public_share_item(updated)}

    def get_public_share(self, share_token: str) -> dict:
        share = self._get_valid_share(share_token, check_password=False)
        self.shares.update_share(share['shareId'], {'lastAccessedAt': utc_now_iso()})
        return {'share': {
            'shareId': share['shareId'],
            'fileName': share.get('fileName'),
            'requiresPassword': share.get('hasPassword', False),
            'expiresAt': share.get('expiresAt'),
            'isOneTime': share.get('isOneTime'),
        }}

    def verify_public_password(self, share_token: str, password: str) -> dict:
        share = self._get_valid_share(share_token, check_password=False)
        if not share.get('hasPassword'):
            return {'message': 'Password not required'}
        if not verify_password(password, share['passwordSalt'], share['passwordHash']):
            raise forbidden('Invalid password')
        return {'message': 'Password verified'}

    def public_download(self, share_token: str, password: str | None, request: Request | None = None) -> dict:
        share = self._get_valid_share(share_token, check_password=True, password=password)
        file = self.items.get_item_for_owner(share['ownerId'], share['fileId'])
        if not file or file.get('status') != 'ACTIVE':
            raise not_found('File not found')
        url = self.s3.generate_presigned_url(
            ClientMethod='get_object',
            Params={'Bucket': settings.s3_bucket_name, 'Key': file['s3Key'], 'ResponseContentDisposition': f'attachment; filename="{file["name"]}"'},
            ExpiresIn=settings.s3_presigned_url_expires_seconds,
        )
        now = utc_now_iso()
        self.shares.increment_download(share['shareId'], mark_used=share.get('isOneTime', False))
        self.items.update_item_for_owner(share['ownerId'], share['fileId'], {'downloadCount': file.get('downloadCount', 0) + 1, 'lastDownloadedAt': now, 'updatedAt': now})
        from app.services.file_service import FileService
        FileService()._record_download(file, share['shareId'], request, 'SHARE_DOWNLOAD')
        self.activity.log(share['ownerId'], 'DOWNLOAD', request, itemId=file['itemId'], shareId=share['shareId'], details=f'Public download: {file["name"]}')
        ip = request.client.host if request and request.client else None
        self.notifications.file_downloaded(file['name'], ip, share.get('ownerEmail'))
        return {'downloadUrl': url}

    def expire_due_links(self) -> int:
        expired = self.shares.find_expired_active(utc_now_iso())
        for share in expired:
            self.shares.update_share(share['shareId'], {'status': 'EXPIRED', 'updatedAt': utc_now_iso()})
            self.notifications.link_expired(share.get('fileName', share.get('fileId', 'file')), share['shareId'])
        return len(expired)

    def _get_valid_share(self, share_token: str, check_password: bool = False, password: str | None = None) -> dict:
        share = self.shares.get_share(share_token)
        if not share:
            raise not_found('Share link not found')
        if share.get('status') != 'ACTIVE':
            raise forbidden('Share link is not active')
        if is_past(share.get('expiresAt')):
            self.shares.update_share(share['shareId'], {'status': 'EXPIRED', 'updatedAt': utc_now_iso()})
            raise forbidden('This link has expired')
        if share.get('isOneTime') and share.get('isUsed'):
            raise forbidden('This one-time link has already been used')
        if check_password and share.get('hasPassword'):
            if not password:
                raise forbidden('Password is required')
            if not verify_password(password, share['passwordSalt'], share['passwordHash']):
                raise forbidden('Invalid password')
        return share

    def _public_share_item(self, item: dict) -> dict:
        excluded = {'passwordHash', 'passwordSalt', 'passwordHashAlgorithm'}
        return {k: v for k, v in item.items() if k not in excluded}
