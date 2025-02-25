from django.conf import settings

# Only import S3 storage if it's going to be used
if getattr(settings, 'USE_S3', False):
    from storages.backends.s3boto3 import S3Boto3Storage
    
    class StaticStorage(S3Boto3Storage):
        location = getattr(settings, 'STATIC_LOCATION', 'static')
        default_acl = 'public-read'
    
    class MediaStorage(S3Boto3Storage):
        location = getattr(settings, 'MEDIA_LOCATION', 'media')
        default_acl = 'public-read'
        file_overwrite = False