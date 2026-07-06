from pydantic import BaseModel, Field


class CreateUploadUrlRequest(BaseModel):
    fileName: str = Field(min_length=1, max_length=255)
    fileSizeBytes: int = Field(ge=1)
    mimeType: str = Field(default='application/octet-stream', max_length=150)
    parentFolderId: str = Field(default='root')


class CompleteUploadRequest(BaseModel):
    fileId: str
    uploadId: str | None = None
    s3Key: str


class RenameItemRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)


class MoveFileRequest(BaseModel):
    targetFolderId: str = Field(default='root')


class CopyFileRequest(BaseModel):
    targetFolderId: str = Field(default='root')
