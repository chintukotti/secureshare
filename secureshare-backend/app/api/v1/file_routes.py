from fastapi import APIRouter, Depends, Query, Request
from app.api.deps import get_current_user
from app.schemas.file_schema import CompleteUploadRequest, CopyFileRequest, CreateUploadUrlRequest, MoveFileRequest, RenameItemRequest
from app.services.file_service import FileService

router = APIRouter(tags=['Files'])


@router.get('/folders/{folder_id}/items')
def list_items(folder_id: str, search: str = Query(default=''), sort: str = Query(default='updatedAt_desc'), user: dict = Depends(get_current_user)):
    return {'items': FileService().list_items(user['userId'], folder_id, search, sort)}


@router.post('/files/upload-url', status_code=201)
def create_upload_url(payload: CreateUploadUrlRequest, user: dict = Depends(get_current_user)):
    return FileService().create_upload_url(user, payload.fileName, payload.fileSizeBytes, payload.mimeType, payload.parentFolderId)


@router.post('/files/complete-upload')
def complete_upload(payload: CompleteUploadRequest, request: Request, user: dict = Depends(get_current_user)):
    return FileService().complete_upload(user['userId'], payload.fileId, payload.s3Key, request)


@router.get('/files/{file_id}/download-url')
def download_url(file_id: str, request: Request, user: dict = Depends(get_current_user)):
    return FileService().get_download_url(user['userId'], file_id, request)


@router.get('/files/{file_id}')
def get_file(file_id: str, user: dict = Depends(get_current_user)):
    item = FileService().items.get_item_for_owner(user['userId'], file_id)
    return {'file': item}


@router.patch('/files/{file_id}')
def rename_file(file_id: str, payload: RenameItemRequest, user: dict = Depends(get_current_user)):
    return {'file': FileService().rename_file(user['userId'], file_id, payload.name)}


@router.delete('/files/{file_id}')
def delete_file(file_id: str, user: dict = Depends(get_current_user)):
    return {'item': FileService().soft_delete(user['userId'], file_id)}


@router.post('/files/{file_id}/copy')
def copy_file(file_id: str, payload: CopyFileRequest, user: dict = Depends(get_current_user)):
    return {'file': FileService().copy(user['userId'], file_id, payload.targetFolderId)}


@router.post('/files/{file_id}/move')
def move_file(file_id: str, payload: MoveFileRequest, user: dict = Depends(get_current_user)):
    return {'file': FileService().move(user['userId'], file_id, payload.targetFolderId)}


@router.post('/files/{file_id}/favorite')
def favorite_file(file_id: str, user: dict = Depends(get_current_user)):
    return {'file': FileService().favorite(user['userId'], file_id, True)}


@router.delete('/files/{file_id}/favorite')
def unfavorite_file(file_id: str, user: dict = Depends(get_current_user)):
    return {'file': FileService().favorite(user['userId'], file_id, False)}


@router.get('/trash')
def trash(user: dict = Depends(get_current_user)):
    return {'items': FileService().list_trash(user['userId'])}


@router.post('/trash/{item_id}/restore')
def restore(item_id: str, user: dict = Depends(get_current_user)):
    return {'item': FileService().restore(user['userId'], item_id)}


@router.delete('/trash/{item_id}/permanent')
def permanent_delete(item_id: str, user: dict = Depends(get_current_user)):
    return FileService().permanently_delete(user['userId'], item_id)
