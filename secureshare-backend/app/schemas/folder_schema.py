from pydantic import BaseModel, Field


class CreateFolderRequest(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    parentFolderId: str = Field(default='root')
