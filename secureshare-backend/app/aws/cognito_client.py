from app.aws.session import boto3_client


def cognito_client():
    return boto3_client('cognito-idp')
