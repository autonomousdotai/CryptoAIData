from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from api.utils.firebase import FirebaseUtil


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
    status = models.CharField(max_length=30, choices=(
        ('VERIFYING', 'VERIFYING'),
        ('DONE', 'Done')),
                              default='VERIFYING')
    type = models.CharField(max_length=30, choices=(('RECYCLE', 'Recycle'), ('NO-RECYCLE', 'Non-recycle')), null=True)
    created = models.DateTimeField(auto_now=True)


@receiver(post_save, sender=Image)
def broadcast_on_created_image(sender, instance, created, **kwargs):
    if created:
        FirebaseUtil().send('NEW_IMAGE', {"id": instance.id, "url": instance.link.url})


class Firmware(models.Model):
    link = models.FileField(upload_to='firmware')
    version = models.CharField(max_length=30)
