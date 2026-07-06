import logging
from app.aws.sns_client import sns_client
from app.core.config import settings

logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self):
        self.client = sns_client()

    def publish(self, subject: str, message: str) -> None:
        if not settings.sns_topic_arn:
            logger.info('SNS_TOPIC_ARN not configured. Skipping notification: %s', subject)
            return
        try:
            self.client.publish(TopicArn=settings.sns_topic_arn, Subject=subject[:100], Message=message)
        except Exception as exc:
            logger.exception('SNS publish failed: %s', exc)

    def file_shared(self, file_name: str, share_url: str, owner_email: str | None = None) -> None:
        self.publish('SecureShare file shared', f'File shared: {file_name}\nShare URL: {share_url}\nOwner: {owner_email or "unknown"}')

    def file_downloaded(self, file_name: str, downloader_ip: str | None = None, owner_email: str | None = None) -> None:
        self.publish('SecureShare file downloaded', f'Your file was downloaded.\nFile: {file_name}\nIP: {downloader_ip or "unknown"}\nOwner: {owner_email or "unknown"}')

    def link_expired(self, file_name: str, share_id: str) -> None:
        self.publish('SecureShare link expired', f'A share link expired.\nFile: {file_name}\nShare ID: {share_id}')
