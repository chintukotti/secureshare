from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix='/analytics', tags=['Analytics'])


@router.get('/files/{file_id}')
def file_analytics(file_id: str, user: dict = Depends(get_current_user)):
    return AnalyticsService().file_analytics(user['userId'], file_id)


@router.get('/most-downloaded')
def most_downloaded(user: dict = Depends(get_current_user)):
    return {'items': AnalyticsService().most_downloaded(user['userId'])}


@router.get('/download-events')
def download_events(user: dict = Depends(get_current_user)):
    return {'items': AnalyticsService().download_events(user['userId'])}
