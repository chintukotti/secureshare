from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.schemas.file_schema import RenameItemRequest
from app.schemas.folder_schema import CreateFolderRequest
from app.services.folder_service import FolderService

router = APIRouter(prefix='/folders', tags=['Folders'])


@router.post('', status_code=201)
def create_folder(payload: CreateFolderRequest, user: dict = Depends(get_current_user)):
    return {'folder': FolderService().create_folder(user['userId'], payload.name, payload.parentFolderId)}


@router.patch('/{folder_id}')
def rename_folder(folder_id: str, payload: RenameItemRequest, user: dict = Depends(get_current_user)):
    return {'folder': FolderService().rename_folder(user['userId'], folder_id, payload.name)}


@router.delete('/{folder_id}')
def delete_folder(folder_id: str, user: dict = Depends(get_current_user)):
    return {'folder': FolderService().delete_folder(user['userId'], folder_id)}
