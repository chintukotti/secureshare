from app.aws.session import boto3_client


def s3_client():
    return boto3_client('s3')
