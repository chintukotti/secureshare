from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', env_file_encoding='utf-8', extra='ignore')

    app_name: str = Field(default='SecureShare', alias='APP_NAME')
    app_env: str = Field(default='dev', alias='APP_ENV')
    aws_region: str = Field(default='ap-south-1', alias='AWS_REGION')

    frontend_public_url: str = Field(default='http://localhost:3000', alias='FRONTEND_PUBLIC_URL')
    backend_cors_origins: str = Field(default='http://localhost:3000', alias='BACKEND_CORS_ORIGINS')

    cognito_user_pool_id: str = Field(default='', alias='COGNITO_USER_POOL_ID')
    cognito_app_client_id: str = Field(default='', alias='COGNITO_APP_CLIENT_ID')

    s3_bucket_name: str = Field(default='', alias='S3_BUCKET_NAME')
    s3_presigned_url_expires_seconds: int = Field(default=900, alias='S3_PRESIGNED_URL_EXPIRES_SECONDS')

    ddb_users_table: str = Field(default='secureshare-dev-users', alias='DDB_USERS_TABLE')
    ddb_items_table: str = Field(default='secureshare-dev-items', alias='DDB_ITEMS_TABLE')
    ddb_share_links_table: str = Field(default='secureshare-dev-share-links', alias='DDB_SHARE_LINKS_TABLE')
    ddb_activity_logs_table: str = Field(default='secureshare-dev-activity-logs', alias='DDB_ACTIVITY_LOGS_TABLE')
    ddb_download_events_table: str = Field(default='secureshare-dev-download-events', alias='DDB_DOWNLOAD_EVENTS_TABLE')

    sns_topic_arn: str = Field(default='', alias='SNS_TOPIC_ARN')
    default_storage_limit_bytes: int = Field(default=10 * 1024 * 1024 * 1024, alias='DEFAULT_STORAGE_LIMIT_BYTES')

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.backend_cors_origins.split(',') if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
