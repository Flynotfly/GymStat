from .base import *

DEBUG = True

INSTALLED_APPS += [
    "django_extensions",
    "drf_spectacular",
]

# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.sqlite3",
#         "NAME": BASE_DIR / "db.sqlite3",
#     }
# }


DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": config("POSTGRES_DB"),
        "USER": config("POSTGRES_USER"),
        "PASSWORD": config("POSTGRES_PASSWORD"),
        "HOST": "localhost",
        "PORT": 5432,
    }
}


ALLOWED_HOSTS = [
    "mysite.example",
    "localhost",
    "127.0.0.1",
    "api.mysite.example",
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
]

CORS_ALLOW_CREDENTIALS = True

# allauth settings
HEADLESS_ONLY = True
HEADLESS_FRONTEND_URLS = {
    "account_confirm_email": "https://localhost:5173/account/verify-email/{key}",
    "account_reset_password": "https://localhost:5173/account/password/reset",
    "account_reset_password_from_key": "https://localhost:5173/account/password/reset/key/{key}",
    "account_signup": "https://localhost:5173/account/signup",
}

REST_FRAMEWORK["DEFAULT_SCHEMA_CLASS"] = "drf_spectacular.openapi.AutoSchema"
