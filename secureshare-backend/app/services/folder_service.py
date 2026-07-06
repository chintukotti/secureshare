from app.core.exceptions import not_found
from app.repositories.item_repository import ItemRepository
from app.repositories.user_repository import UserRepository
from app.utils.datetime_utils import utc_now_iso
from app.utils.file_utils import normalize_name
from app.utils.id_generator import new_id


class FolderService:
    def __init__(self):
        self.items = ItemRepository()
        self.users = UserRepository()

    def create_folder(self, owner_id: str, name: str, parent_folder_id: str = 'root') -> dict:
        now = utc_now_iso()
        folder = {
            'ownerId': owner_id,
            'itemId': new_id('folder'),
            'itemType': 'FOLDER',
            'parentFolderId': parent_folder_id,
            'name': name.strip(),
            'normalizedName': normalize_name(name),
            'isFavorite': False,
            'status': 'ACTIVE',
            'downloadCount': 0,
            'viewCount': 0,
            'createdAt': now,
            'updatedAt': now,
        }
        self.items.put_item(folder)
        return folder

    def rename_folder(self, owner_id: str, folder_id: str, name: str) -> dict:
        folder = self.items.get_item_for_owner(owner_id, folder_id)
        if not folder or folder.get('itemType') != 'FOLDER':
            raise not_found('Folder not found')
        return self.items.update_item_for_owner(owner_id, folder_id, {'name': name.strip(), 'normalizedName': normalize_name(name), 'updatedAt': utc_now_iso()})

    def delete_folder(self, owner_id: str, folder_id: str) -> dict:
        folder = self.items.get_item_for_owner(owner_id, folder_id)
        if not folder or folder.get('itemType') != 'FOLDER':
            raise not_found('Folder not found')
        return self.items.update_item_for_owner(owner_id, folder_id, {'status': 'TRASHED', 'trashedAt': utc_now_iso(), 'updatedAt': utc_now_iso()})
