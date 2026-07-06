from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.services.dashboard_service import DashboardService
from app.services.file_service import FileService

router = APIRouter(prefix='/dashboard', tags=['Dashboard'])


@router.get('/summary')
def summary(user: dict = Depends(get_current_user)):
    return {'summary': DashboardService().summary(user['userId'])}


@router.get('/recent-uploads')
def recent_uploads(user: dict = Depends(get_current_user)):
    return {'items': FileService().recent_uploads(user['userId'])}


@router.get('/recent-downloads')
def recent_downloads(user: dict = Depends(get_current_user)):
    return {'items': DashboardService().recent_downloads(user['userId'])}
