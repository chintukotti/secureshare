import base64
import json
from botocore.exceptions import ClientError
from fastapi import Request
from app.aws.cognito_client import cognito_client
from app.core.config import settings
from app.core.exceptions import bad_request, unauthorized
from app.repositories.user_repository import UserRepository
from app.services.activity_service import ActivityService
from app.utils.datetime_utils import utc_now_iso


def _get_attr(attributes: list[dict], name: str) -> str | None:
    for item in attributes:
        if item.get('Name') == name:
            return item.get('Value')
    return None


def _decode_jwt_payload_without_verification(token: str) -> dict:
    try:
        payload = token.split('.')[1]
        payload += '=' * (-len(payload) % 4)
        return json.loads(base64.urlsafe_b64decode(payload.encode('utf-8')))
    except Exception:
        return {}


class AuthService:
    def __init__(self):
        self.client = cognito_client()
        self.users = UserRepository()
        self.activity = ActivityService()

    def register(self, full_name: str, email: str, password: str) -> dict:
        try:
            response = self.client.sign_up(
                ClientId=settings.cognito_app_client_id,
                Username=email,
                Password=password,
                UserAttributes=[
                    {'Name': 'email', 'Value': email},
                    {'Name': 'name', 'Value': full_name},
                ],
            )
            user_id = response['UserSub']
            now = utc_now_iso()
            self.users.put_item({
                'userId': user_id,
                'email': email,
                'fullName': full_name,
                'storageUsedBytes': 0,
                'storageLimitBytes': settings.default_storage_limit_bytes,
                'totalFiles': 0,
                'totalFolders': 0,
                'status': 'PENDING_EMAIL_VERIFICATION',
                'createdAt': now,
                'updatedAt': now,
            })
            return {'message': 'Registration successful. Please verify your email.', 'userId': user_id}
        except ClientError as exc:
            raise bad_request(exc.response['Error'].get('Message', 'Registration failed'))

    def confirm_email(self, email: str, code: str) -> dict:
        try:
            self.client.confirm_sign_up(ClientId=settings.cognito_app_client_id, Username=email, ConfirmationCode=code)
            return {'message': 'Email verified successfully'}
        except ClientError as exc:
            raise bad_request(exc.response['Error'].get('Message', 'Email verification failed'))

    def login(self, email: str, password: str, request: Request | None = None) -> dict:
        try:
            response = self.client.initiate_auth(
                ClientId=settings.cognito_app_client_id,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={'USERNAME': email, 'PASSWORD': password},
            )
            auth = response['AuthenticationResult']
            user_info = self.client.get_user(AccessToken=auth['AccessToken'])
            user = self._build_user_from_cognito(user_info)
            existing = self.users.get_user(user['userId'])
            if existing:
                user = {**existing, **user}
            else:
                now = utc_now_iso()
                user.update({'storageUsedBytes': 0, 'storageLimitBytes': settings.default_storage_limit_bytes, 'totalFiles': 0, 'totalFolders': 0, 'status': 'ACTIVE', 'createdAt': now, 'updatedAt': now})
                self.users.put_item(user)
            self.activity.log(user['userId'], 'LOGIN', request, details='User logged in')
            return {
                'accessToken': auth['AccessToken'],
                'idToken': auth.get('IdToken'),
                'refreshToken': auth.get('RefreshToken'),
                'expiresIn': auth.get('ExpiresIn'),
                'tokenType': auth.get('TokenType'),
                'user': user,
            }
        except ClientError as exc:
            raise unauthorized(exc.response['Error'].get('Message', 'Invalid email or password'))

    def logout(self, access_token: str) -> dict:
        try:
            self.client.global_sign_out(AccessToken=access_token)
        except ClientError:
            pass
        return {'message': 'Logged out successfully'}

    def forgot_password(self, email: str) -> dict:
        try:
            self.client.forgot_password(ClientId=settings.cognito_app_client_id, Username=email)
            return {'message': 'Password reset code sent'}
        except ClientError as exc:
            raise bad_request(exc.response['Error'].get('Message', 'Unable to send password reset code'))

    def reset_password(self, email: str, code: str, new_password: str) -> dict:
        try:
            self.client.confirm_forgot_password(ClientId=settings.cognito_app_client_id, Username=email, ConfirmationCode=code, Password=new_password)
            return {'message': 'Password reset successful'}
        except ClientError as exc:
            raise bad_request(exc.response['Error'].get('Message', 'Password reset failed'))

    def change_password(self, access_token: str, old_password: str, new_password: str) -> dict:
        try:
            self.client.change_password(AccessToken=access_token, PreviousPassword=old_password, ProposedPassword=new_password)
            return {'message': 'Password changed successfully'}
        except ClientError as exc:
            raise bad_request(exc.response['Error'].get('Message', 'Unable to change password'))

    def get_user_from_access_token(self, access_token: str) -> dict:
        try:
            response = self.client.get_user(AccessToken=access_token)
            user = self._build_user_from_cognito(response)
            db_user = self.users.get_user(user['userId'])
            return {**(db_user or {}), **user}
        except ClientError as exc:
            raise unauthorized(exc.response['Error'].get('Message', 'Invalid or expired token'))

    def _build_user_from_cognito(self, response: dict) -> dict:
        attrs = response.get('UserAttributes', [])
        user_id = _get_attr(attrs, 'sub') or response.get('Username')
        email = _get_attr(attrs, 'email')
        full_name = _get_attr(attrs, 'name') or email
        return {'userId': user_id, 'email': email, 'fullName': full_name, 'status': 'ACTIVE'}
