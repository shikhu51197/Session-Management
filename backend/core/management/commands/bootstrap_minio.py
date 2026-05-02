import json

import boto3
from botocore.client import Config
from botocore.exceptions import ClientError
from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Create the local S3 bucket used by MinIO if it does not already exist.'

    def handle(self, *args, **options):
        if not settings.AWS_S3_ENDPOINT_URL:
            self.stdout.write(self.style.WARNING('AWS_S3_ENDPOINT_URL is not configured; skipping bucket bootstrap.'))
            return

        client = boto3.client(
            's3',
            endpoint_url=settings.AWS_S3_ENDPOINT_URL,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            config=Config(signature_version='s3v4'),
            region_name=getattr(settings, 'AWS_S3_REGION_NAME', 'us-east-1'),
        )
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME

        try:
            client.head_bucket(Bucket=bucket_name)
            self.stdout.write(f'Bucket "{bucket_name}" already exists.')
        except ClientError:
            client.create_bucket(Bucket=bucket_name)
            self.stdout.write(self.style.SUCCESS(f'Created bucket "{bucket_name}".'))

        policy = {
            'Version': '2012-10-17',
            'Statement': [
                {
                    'Effect': 'Allow',
                    'Principal': {'AWS': ['*']},
                    'Action': ['s3:GetObject'],
                    'Resource': [f'arn:aws:s3:::{bucket_name}/*'],
                }
            ],
        }
        client.put_bucket_policy(Bucket=bucket_name, Policy=json.dumps(policy))
        self.stdout.write(self.style.SUCCESS(f'Configured public read policy for "{bucket_name}".'))
