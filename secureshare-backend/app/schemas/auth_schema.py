from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    fullName: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    confirmPassword: str | None = None


class ConfirmEmailRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=4, max_length=20)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    newPassword: str = Field(min_length=8, max_length=128)


class ChangePasswordRequest(BaseModel):
    oldPassword: str
    newPassword: str = Field(min_length=8, max_length=128)
