from fastapi import APIRouter, Depends, Request
from app.api.deps import get_current_user
from app.schemas.share_schema import CreateShareLinkRequest, PublicDownloadRequest, UpdateShareLinkRequest, VerifyPasswordRequest
from app.services.share_service import ShareService

router = APIRouter(tags=['Shares'])


@router.post('/shares', status_code=201)
def create_share(payload: CreateShareLinkRequest, request: Request, user: dict = Depends(get_current_user)):
    return ShareService().create_share_link(user, payload.fileId, payload.expiresInMinutes, payload.isOneTime, payload.visibility, payload.password, request)


@router.get('/shares')
def list_shares(user: dict = Depends(get_current_user)):
    return {'shares': ShareService().list_shares(user['userId'])}


@router.get('/shares/{share_id}')
def get_share(share_id: str, user: dict = Depends(get_current_user)):
    return {'share': ShareService().get_owner_share(user['userId'], share_id)}


@router.patch('/shares/{share_id}')
def update_share(share_id: str, payload: UpdateShareLinkRequest, user: dict = Depends(get_current_user)):
    if payload.status == 'REVOKED':
        return ShareService().revoke(user['userId'], share_id)
    return {'share': ShareService().get_owner_share(user['userId'], share_id)}


@router.delete('/shares/{share_id}')
def revoke_share(share_id: str, user: dict = Depends(get_current_user)):
    return ShareService().revoke(user['userId'], share_id)


@router.get('/public/shares/{share_token}')
def public_share(share_token: str):
    return ShareService().get_public_share(share_token)


@router.post('/public/shares/{share_token}/verify-password')
def verify_password(share_token: str, payload: VerifyPasswordRequest):
    return ShareService().verify_public_password(share_token, payload.password)


@router.post('/public/shares/{share_token}/download')
def public_download(share_token: str, payload: PublicDownloadRequest, request: Request):
    return ShareService().public_download(share_token, payload.password, request)
