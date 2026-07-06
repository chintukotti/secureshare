from app.core.config import settings
from app.repositories.base_repository import BaseRepository
from app.utils.ddb_utils import from_dynamodb_value


class UserRepository(BaseRepository):
    def __init__(self):
        super().__init__(settings.ddb_users_table)

    def get_user(self, user_id: str) -> dict | None:
        return self.get_item({'userId': user_id})

    def update_user(self, user_id: str, updates: dict) -> dict:
        names = {f'#k{i}': k for i, k in enumerate(updates)}
        values = {f':v{i}': v for i, v in enumerate(updates.values())}
        expression = 'SET ' + ', '.join(f'{nk} = :v{i}' for i, nk in enumerate(names.keys()))
        response = self.table.update_item(
            Key={'userId': user_id},
            UpdateExpression=expression,
            ExpressionAttributeNames=names,
            ExpressionAttributeValues=values,
            ReturnValues='ALL_NEW',
        )
        return from_dynamodb_value(response['Attributes'])

    def add_storage_usage(self, user_id: str, bytes_to_add: int) -> dict:
        response = self.table.update_item(
            Key={'userId': user_id},
            UpdateExpression='SET updatedAt = :updatedAt ADD storageUsedBytes :bytes, totalFiles :one',
            ExpressionAttributeValues={':bytes': bytes_to_add, ':one': 1, ':updatedAt': updates_now()},
            ReturnValues='ALL_NEW',
        )
        return from_dynamodb_value(response['Attributes'])


def updates_now():
    from app.utils.datetime_utils import utc_now_iso
    return utc_now_iso()
