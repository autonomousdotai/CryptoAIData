"""
Django settings for trashcan project.

Generated by 'django-admin startproject' using Django 2.0.4.

For more information on this file, see
https://docs.djangoproject.com/en/2.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/2.0/ref/settings/
"""

import os
import datetime

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/2.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '38@j*5ch2#jyb0=_yk$6v=15u4fqw@%it-qe(q%i6=7nw+m%c8'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', True)

ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '35.198.228.87', '35.240.183.111', '35.240.158.83', '10.39.244.233', '10.39.247.173', 'dad.ninja.org']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'api',
    'django_filters',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'trashcan.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')]
        ,
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'trashcan.wsgi.application'


# Database
# https://docs.djangoproject.com/en/2.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('DB_NAME', 'trashcan_dev'),
        'USER': os.environ.get('DB_USER', 'root'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', '127.0.0.1'),
        'PORT': '3306',
    }
}


# Password validation
# https://docs.djangoproject.com/en/2.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/2.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.0/howto/static-files/

STATIC_URL = '/static/'


SECRET_KEY_JWT = 'autonomousaA!@#'

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 12,
    'DEFAULT_FILTER_BACKENDS': ('django_filters.rest_framework.DjangoFilterBackend',)
}


JWT_AUTH = {
    'JWT_PAYLOAD_GET_USERNAME_HANDLER':
    'api.custom_jwt.jwt_get_username_from_payload_handler',
    'JWT_SECRET_KEY': SECRET_KEY_JWT,
    'JWT_EXPIRATION_DELTA': datetime.timedelta(days=365*10),
}

AUTONOMOUS_API_HOST = os.environ.get('AUTONOMOUS_API_HOST', 'https://dev.autonomous.ai')
AUTONOMOUS_API_SIGNUP = '%s/api-v2/customer-api/sign-in' % AUTONOMOUS_API_HOST
AUTONOMOUS_API_AUTH = '%s/api-v2/customer-api/sign-in' % AUTONOMOUS_API_HOST

CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_CREDENTIALS = True
CORS_ORIGIN_WHITELIST = (
    'localhost:8080',
    '127.0.0.1:8080',
    '35.197.74.148',
)
CORS_ORIGIN_REGEX_WHITELIST = (
    'localhost:8080',
    '127.0.0.1:8080',
    '35.197.74.148',
)

CONTRACT_ADDRESS = '0xF2Ce91Cb3c02FcCcf554e25B0E50B57b3Fa9C7Ed'


DEFAULT_FILE_STORAGE = 'packages.storages.backends.gcloud.GoogleCloudStorage'

GS_BUCKET_NAME='oskar-ai'
GS_AUTO_CREATE_ACL = 'publicRead'
GS_FILE_OVERWRITE = False
GS_AUTO_CREATE_BUCKET = True

FIREBASE_ADMIN_ACCOUNT = os.environ.get('FIREBASE_ADMIN_ACCOUNT', 'admin@autonomous.nyc')
FIREBASE_ADMIN_PASSWORD = os.environ.get('FIREBASE_ADMIN_PASSWORD', 'Ab123456')
FIREBASE_API_KEY = os.environ.get('FIREBASE_API_KEY', 'AIzaSyDfviFngAts1xvYzkasrSrkLu_BIdmzghQ')
FIREBASE_DATABASE_URL = os.environ.get('FIREBASE_DATABASE_URL', 'https://trashcan-test.firebaseio.com/')
