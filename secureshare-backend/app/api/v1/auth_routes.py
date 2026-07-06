from fastapi import APIRouter, Depends, Request
from app.api.deps import extract_bearer_token, get_current_user
from app.schemas.auth_schema import ChangePasswordRequest, ConfirmEmailRequest, ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest
from app.services.auth_service import AuthService

router = APIRouter(prefix='/auth', tags=['Auth'])


@router.post('/register', status_code=201)
def register(payload: RegisterRequest):
    return AuthService().register(payload.fullName, payload.email, payload.password)


@router.post('/confirm-email')
def confirm_email(payload: ConfirmEmailRequest):
    return AuthService().confirm_email(payload.email, payload.code)


@router.post('/login')
def login(payload: LoginRequest, request: Request):
    return AuthService().login(payload.email, payload.password, request)


@router.post('/logout')
def logout(access_token: str = Depends(extract_bearer_token)):
    return AuthService().logout(access_token)


@router.post('/forgot-password')
def forgot_password(payload: ForgotPasswordRequest):
    return AuthService().forgot_password(payload.email)


@router.post('/reset-password')
def reset_password(payload: ResetPasswordRequest):
    return AuthService().reset_password(payload.email, payload.code, payload.newPassword)


@router.post('/change-password')
def change_password(payload: ChangePasswordRequest, access_token: str = Depends(extract_bearer_token)):
    return AuthService().change_password(access_token, payload.oldPassword, payload.newPassword)


@router.get('/me')
def me(user: dict = Depends(get_current_user)):
    return {'user': user}
