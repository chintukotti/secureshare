from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.services.activity_service import ActivityService

router = APIRouter(prefix='/activity', tags=['Activity'])


@router.get('')
def list_activity(user: dict = Depends(get_current_user)):
    return {'logs': ActivityService().list_activity(user['userId'])}


@router.get('/files/{file_id}')
def list_file_activity(file_id: str, user: dict = Depends(get_current_user)):
    logs = [log for log in ActivityService().list_activity(user['userId']) if log.get('itemId') == file_id]
    return {'logs': logs}
