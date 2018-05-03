from django.db import models
from django.contrib.auth.models import User


class Profile(models.Model):
    def __str__(self):
        return '%s' % self.user.username

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    ether_address = models.CharField(max_length=255, null=False)
    ref_id = models.IntegerField()


class Product(models.Model):
    TYPE_CHOICES = (
        ('PAY_ONCE', 'Pay once'),
        ('SUBSCRIPTION', 'Subscription')
    )
    profile = models.ForeignKey(Profile, related_name='products', on_delete=models.DO_NOTHING)
    name = models.CharField(max_length=255, null=False, unique=True)
    type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='PAY_ONCE')


class Image(models.Model):
    link = models.ImageField(upload_to='img')
    product = models.ForeignKey(Product, on_delete=models.DO_NOTHING)
    status = models.CharField(max_length=30, choices=(('VERIFYING', 'Verifying'), ('DONE', 'Done')),
                              default='VERIFYING')
    type = models.CharField(max_length=30, choices=(('RECYCLE', 'Recycle'), ('NO-RECYCLE', 'Non-recycle')), null=True)


class Firmware(models.Model):
    link = models.FileField(upload_to='firmware')
    version = models.CharField(max_length=30)
