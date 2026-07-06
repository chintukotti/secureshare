from app.repositories.download_repository import DownloadRepository
from app.repositories.item_repository import ItemRepository
from app.repositories.share_repository import ShareRepository
from app.repositories.user_repository import UserRepository


class DashboardService:
    def __init__(self):
        self.users = UserRepository()
        self.items = ItemRepository()
        self.shares = ShareRepository()
        self.downloads = DownloadRepository()

    def summary(self, owner_id: str) -> dict:
        user = self.users.get_user(owner_id) or {}
        active = self.items.list_all_active(owner_id)
        files = [i for i in active if i.get('itemType') == 'FILE']
        folders = [i for i in active if i.get('itemType') == 'FOLDER']
        shared = [s for s in self.shares.list_by_owner(owner_id) if s.get('status') == 'ACTIVE']
        return {
            'storageUsedBytes': sum(f.get('fileSizeBytes', 0) for f in files),
            'storageLimitBytes': user.get('storageLimitBytes', 10 * 1024 * 1024 * 1024),
            'totalFiles': len(files),
            'totalFolders': len(folders),
            'sharedFiles': len(shared),
        }

    def recent_downloads(self, owner_id: str) -> list[dict]:
        return self.downloads.list_by_owner(owner_id)[:10]
