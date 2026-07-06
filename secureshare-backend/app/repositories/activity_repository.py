from boto3.dynamodb.conditions import Key
from app.core.config import settings
from app.repositories.base_repository import BaseRepository
from app.utils.ddb_utils import from_dynamodb_value


class ActivityRepository(BaseRepository):
    def __init__(self):
        super().__init__(settings.ddb_activity_logs_table)

    def list_by_owner(self, owner_id: str, limit: int = 50) -> list[dict]:
        response = self.table.query(
            KeyConditionExpression=Key('ownerId').eq(owner_id),
            ScanIndexForward=False,
            Limit=limit,
        )
        return from_dynamodb_value(response.get('Items', []))
