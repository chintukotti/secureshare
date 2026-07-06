from boto3.dynamodb.conditions import Attr
from app.core.config import settings
from app.repositories.base_repository import BaseRepository
from app.utils.ddb_utils import from_dynamodb_value


class ShareRepository(BaseRepository):
    def __init__(self):
        super().__init__(settings.ddb_share_links_table)

    def get_share(self, share_id: str) -> dict | None:
        return self.get_item({'shareId': share_id})

    def list_by_owner(self, owner_id: str) -> list[dict]:
        response = self.table.scan(FilterExpression=Attr('ownerId').eq(owner_id))
        return sorted(from_dynamodb_value(response.get('Items', [])), key=lambda x: x.get('createdAt', ''), reverse=True)

    def update_share(self, share_id: str, updates: dict) -> dict:
        names = {f'#k{i}': k for i, k in enumerate(updates)}
        values = {f':v{i}': v for i, v in enumerate(updates.values())}
        expression = 'SET ' + ', '.join(f'{nk} = :v{i}' for i, nk in enumerate(names.keys()))
        response = self.table.update_item(
            Key={'shareId': share_id},
            UpdateExpression=expression,
            ExpressionAttributeNames=names,
            ExpressionAttributeValues=values,
            ReturnValues='ALL_NEW',
        )
        return from_dynamodb_value(response['Attributes'])

    def increment_download(self, share_id: str, mark_used: bool = False) -> dict:
        update_expression = 'SET lastAccessedAt = :now ADD downloadCount :one'
        values = {':one': 1, ':now': __import__('app.utils.datetime_utils', fromlist=['utc_now_iso']).utc_now_iso()}
        if mark_used:
            update_expression = 'SET lastAccessedAt = :now, isUsed = :true ADD downloadCount :one'
            values[':true'] = True
        response = self.table.update_item(
            Key={'shareId': share_id},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=values,
            ReturnValues='ALL_NEW',
        )
        return from_dynamodb_value(response['Attributes'])

    def find_expired_active(self, now_iso: str) -> list[dict]:
        response = self.table.scan(FilterExpression=Attr('status').eq('ACTIVE') & Attr('expiresAt').lte(now_iso))
        return from_dynamodb_value(response.get('Items', []))
