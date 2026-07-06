from pydantic import BaseModel, Field


class CreateShareLinkRequest(BaseModel):
    fileId: str
    expiresInMinutes: int = Field(default=60, ge=1, le=10080)
    isOneTime: bool = False
    visibility: str = Field(default='PUBLIC')
    password: str | None = Field(default=None, min_length=4, max_length=128)


class UpdateShareLinkRequest(BaseModel):
    status: str | None = None


class VerifyPasswordRequest(BaseModel):
    password: str = Field(min_length=1, max_length=128)


class PublicDownloadRequest(BaseModel):
    password: str | None = None
