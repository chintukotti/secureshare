from fastapi import Depends, Header
from app.core.exceptions import unauthorized
from app.services.auth_service import AuthService


def extract_bearer_token(authorization: str | None = Header(default=None)) -> str:
    if not authorization or not authorization.startswith('Bearer '):
        raise unauthorized('Missing bearer token')
    return authorization.replace('Bearer ', '', 1).strip()


def get_current_user(access_token: str = Depends(extract_bearer_token)) -> dict:
    return AuthService().get_user_from_access_token(access_token)
