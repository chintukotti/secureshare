from boto3.dynamodb.conditions import Attr, Key
from app.core.config import settings
from app.repositories.base_repository import BaseRepository
from app.utils.ddb_utils import from_dynamodb_value


class DownloadRepository(BaseRepository):
    def __init__(self):
        super().__init__(settings.ddb_download_events_table)

    def list_by_file(self, file_id: str, limit: int = 50) -> list[dict]:
        response = self.table.query(
            KeyConditionExpression=Key('fileId').eq(file_id),
            ScanIndexForward=False,
            Limit=limit,
        )
        return from_dynamodb_value(response.get('Items', []))

    def list_by_owner(self, owner_id: str) -> list[dict]:
        response = self.table.scan(FilterExpression=Attr('ownerId').eq(owner_id))
        return sorted(from_dynamodb_value(response.get('Items', [])), key=lambda x: x.get('downloadedAt', ''), reverse=True)
