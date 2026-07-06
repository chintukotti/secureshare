from botocore.exceptions import ClientError
from app.aws.dynamodb_client import dynamodb_resource
from app.utils.ddb_utils import from_dynamodb_value, to_dynamodb_value


class BaseRepository:
    def __init__(self, table_name: str):
        self.table = dynamodb_resource().Table(table_name)

    def put_item(self, item: dict) -> dict:
        clean = to_dynamodb_value(item)
        self.table.put_item(Item=clean)
        return from_dynamodb_value(clean)

    def get_item(self, key: dict) -> dict | None:
        response = self.table.get_item(Key=key)
        item = response.get('Item')
        return from_dynamodb_value(item) if item else None

    def delete_item(self, key: dict) -> None:
        self.table.delete_item(Key=key)
