from app.repositories.download_repository import DownloadRepository
from app.repositories.item_repository import ItemRepository


class AnalyticsService:
    def __init__(self):
        self.items = ItemRepository()
        self.downloads = DownloadRepository()

    def most_downloaded(self, owner_id: str) -> list[dict]:
        files = [i for i in self.items.list_all_active(owner_id) if i.get('itemType') == 'FILE']
        result = [{
            'fileId': f['itemId'],
            'fileName': f['name'],
            'downloadCount': f.get('downloadCount', 0),
            'viewCount': f.get('viewCount', 0),
            'lastDownloadedAt': f.get('lastDownloadedAt'),
        } for f in files]
        return sorted(result, key=lambda x: x.get('downloadCount', 0), reverse=True)[:10]

    def file_analytics(self, owner_id: str, file_id: str) -> dict:
        file = self.items.get_item_for_owner(owner_id, file_id)
        events = self.downloads.list_by_file(file_id)
        return {'file': file, 'events': events, 'downloadCount': len(events)}

    def download_events(self, owner_id: str) -> list[dict]:
        return self.downloads.list_by_owner(owner_id)
