import django_filters
from api.models import Image
from django_filters import BooleanFilter
from datetime import datetime
from django.utils import timezone


def filter_offline_verify(queryset, name, value):
    return queryset.filter(**{'created__lt': timezone.now() - timezone.timedelta(seconds=10)})


class ImageFilter(django_filters.FilterSet):
    """Filter for Books by if books are published or not"""
    offline_verify = BooleanFilter(name='created', method=filter_offline_verify)

    class Meta:
        model = Image
        fields = ['offline_verify']
