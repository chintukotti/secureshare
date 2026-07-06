import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import configure_logging
from app.services.share_service import ShareService

configure_logging()
logger = logging.getLogger(__name__)


async def expiry_watcher() -> None:
    """Small EC2 background task for demo link-expiry notifications.

    In high-scale production, use EventBridge + Lambda or a queue-based worker.
    For this Free Tier EC2 project, this keeps the feature working without extra paid architecture.
    """
    while True:
        try:
            count = ShareService().expire_due_links()
            if count:
                logger.info('Expired %s share links', count)
        except Exception as exc:
            logger.exception('Expiry watcher failed: %s', exc)
        await asyncio.sleep(900)


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(expiry_watcher())
    yield
    task.cancel()


app = FastAPI(
    title=settings.app_name,
    version='1.0.0',
    description='SecureShare FastAPI backend using Cognito, S3, DynamoDB, SNS, and CloudWatch logs.',
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/health')
def health():
    return {'status': 'ok', 'service': settings.app_name, 'environment': settings.app_env}


app.include_router(api_router)
