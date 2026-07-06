from boto3.dynamodb.conditions import Attr, Key
from app.core.config import settings
from app.repositories.base_repository import BaseRepository
from app.utils.ddb_utils import from_dynamodb_value


class ItemRepository(BaseRepository):
    def __init__(self):
        super().__init__(settings.ddb_items_table)

    def get_item_for_owner(self, owner_id: str, item_id: str) -> dict | None:
        return self.get_item({'ownerId': owner_id, 'itemId': item_id})

    def list_items(self, owner_id: str, parent_folder_id: str = 'root', status: str = 'ACTIVE') -> list[dict]:
        response = self.table.query(
            KeyConditionExpression=Key('ownerId').eq(owner_id),
            FilterExpression=Attr('parentFolderId').eq(parent_folder_id) & Attr('status').eq(status),
        )
        return from_dynamodb_value(response.get('Items', []))

    def list_all_active(self, owner_id: str) -> list[dict]:
        response = self.table.query(
            KeyConditionExpression=Key('ownerId').eq(owner_id),
            FilterExpression=Attr('status').eq('ACTIVE'),
        )
        return from_dynamodb_value(response.get('Items', []))

    def list_trash(self, owner_id: str) -> list[dict]:
        response = self.table.query(
            KeyConditionExpression=Key('ownerId').eq(owner_id),
            FilterExpression=Attr('status').eq('TRASHED'),
        )
        return from_dynamodb_value(response.get('Items', []))

    def update_item_for_owner(self, owner_id: str, item_id: str, updates: dict) -> dict:
        names = {f'#k{i}': k for i, k in enumerate(updates)}
        values = {f':v{i}': v for i, v in enumerate(updates.values())}
        expression = 'SET ' + ', '.join(f'{nk} = :v{i}' for i, nk in enumerate(names.keys()))
        response = self.table.update_item(
            Key={'ownerId': owner_id, 'itemId': item_id},
            UpdateExpression=expression,
            ExpressionAttributeNames=names,
            ExpressionAttributeValues=values,
            ReturnValues='ALL_NEW',
        )
        return from_dynamodb_value(response['Attributes'])

    def increment_counter(self, owner_id: str, item_id: str, field: str) -> dict:
        response = self.table.update_item(
            Key={'ownerId': owner_id, 'itemId': item_id},
            UpdateExpression=f'ADD {field} :one',
            ExpressionAttributeValues={':one': 1},
            ReturnValues='ALL_NEW',
        )
        return from_dynamodb_value(response['Attributes'])
