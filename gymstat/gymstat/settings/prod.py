from .base import *

DEBUG = False

ADMINS = [
    ('Mikhail', 'Alteria2004@gmail.com'),
]

ALLOWED_HOSTS = ['*']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('POSTGRES_DB'),
        'USER': config('POSTGRES_USER'),
        'PASSWORD': config('POSTGRES_PASSWORD'),
        'HOST': 'db',
        'PORT': 5432,
    }
}

REDIS_URL = 'redis://cache:6379'
CACHES['default']['LOCATION'] = REDIS_URL

CACHE_MIDDLEWARE_ALIAS = 'default'
CACHE_MIDDLEWARE_SECONDS = 60 * 15  # 15 minutes
CACHE_MIDDLEWARE_KEY_PREFIX = 'gymstat'

INTERNAL_IPS = [
    '127.0.0.1',
]

CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True

# TODO: solve
#  (security.W004) You have not set a value for the SECURE_HSTS_SECONDS setting.
#  If your entire site is served only over SSL,
#  you may want to consider setting a value and enabling HTTP Strict Transport Security.
#  Be sure to read the documentation first;
#  enabling HSTS carelessly can cause serious, irreversible problems.
