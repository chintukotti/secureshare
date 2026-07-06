from fastapi import APIRouter, Depends
from app.api.deps import get_current_user
from app.repositories.user_repository import UserRepository
from app.schemas.profile_schema import UpdateProfileRequest
from app.utils.datetime_utils import utc_now_iso

router = APIRouter(prefix='/profile', tags=['Profile'])


@router.patch('')
def update_profile(payload: UpdateProfileRequest, user: dict = Depends(get_current_user)):
    updated = UserRepository().update_user(user['userId'], {'fullName': payload.fullName, 'updatedAt': utc_now_iso()})
    return {'user': updated}
