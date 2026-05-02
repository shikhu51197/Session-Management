from storages.backends.s3boto3 import S3Boto3Storage

class LocalS3Storage(S3Boto3Storage):
    """
    Custom S3 storage class that forces the URL protocol to http for local development.
    """
    def url(self, name, parameters=None, expire=None, http_method=None):
        url = super().url(name, parameters, expire, http_method)
        if url.startswith('https://'):
            return url.replace('https://', 'http://', 1)
        return url
