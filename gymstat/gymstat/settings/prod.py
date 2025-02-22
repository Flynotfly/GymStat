from .base import *

DEBUG = False

ADMINS = [
    ('Mikhail Kudryashov', 'Alteria2004@gmail.com'),
]

ALLOWED_HOSTS = ['backend.orange-city.ru', 'system.orange-city.ru']

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

# INTERNAL_IPS = [
#     '127.0.0.1',
# ]

CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True

SESSION_COOKIE_DOMAIN = ".orange-city.ru"
CSRF_COOKIE_DOMAIN = ".orange-city.ru"
CSRF_TRUSTED_ORIGINS = [
    "https://backend.orange-city.ru",
    "https://system.orange-city.ru",
]

SECURE_HSTS_SECONDS = 3600
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

CORS_ALLOWED_ORIGINS = [
    "https://backend.orange-city.ru",
    "https://system.orange-city.ru",
]

CORS_ALLOW_CREDENTIALS = True
