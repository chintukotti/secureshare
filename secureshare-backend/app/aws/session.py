import boto3
from app.core.config import settings


def boto3_client(service_name: str):
    return boto3.client(service_name, region_name=settings.aws_region)


def boto3_resource(service_name: str):
    return boto3.resource(service_name, region_name=settings.aws_region)
