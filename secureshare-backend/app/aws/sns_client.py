from app.aws.session import boto3_client


def sns_client():
    return boto3_client('sns')
