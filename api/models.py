from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    def __str__(self):
        return '%s' % self.user.username

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    ether_address = models.CharField(max_length=255, null=False)
    ref_id = models.IntegerField()


class Product(models.Model):
    name = models.CharField(max_length=255, null=False, unique=True)


class Image(models.Model):
    link = models.ImageField(upload_to='img')
    trash_type = models.CharField(max_length=255, null=True)
    product = models.ForeignKey(Product, on_delete=models.DO_NOTHING)


class Firmware(models.Model):
    link = models.FileField(upload_to='firmware')
    version = models.CharField(max_length=30)
