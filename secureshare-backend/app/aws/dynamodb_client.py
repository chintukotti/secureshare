from app.aws.session import boto3_resource


def dynamodb_resource():
    return boto3_resource('dynamodb')
