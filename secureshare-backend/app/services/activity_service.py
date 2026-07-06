from fastapi import Request
from app.repositories.activity_repository import ActivityRepository
from app.utils.datetime_utils import utc_now_iso
from app.utils.id_generator import new_id


class ActivityService:
    def __init__(self):
        self.repo = ActivityRepository()

    def log(self, owner_id: str, action: str, request: Request | None = None, **kwargs) -> dict:
        log_id = new_id('log')
        now = utc_now_iso()
        item = {
            'ownerId': owner_id,
            'timestampLogId': f'{now}#{log_id}',
            'logId': log_id,
            'actorUserId': kwargs.get('actorUserId', owner_id),
            'action': action,
            'itemId': kwargs.get('itemId'),
            'shareId': kwargs.get('shareId'),
            'ipAddress': request.client.host if request and request.client else kwargs.get('ipAddress'),
            'userAgent': request.headers.get('user-agent') if request else kwargs.get('userAgent'),
            'details': kwargs.get('details'),
            'createdAt': now,
        }
        return self.repo.put_item(item)

    def list_activity(self, owner_id: str) -> list[dict]:
        return self.repo.list_by_owner(owner_id)
