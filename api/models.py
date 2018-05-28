from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from api.utils.firebase import FirebaseUtil

IMAGE_TYPE_CHOISE = (
    (0, 'Bottle'),
    (1, 'Cans of metal'),
    (2, 'Newspapers, writing paper'),
    (3, 'Stories, magazines'),
    (4, 'Carton water box'),
    (5, 'Paper cup'),
    (6, 'Carton box, paper box'),
    (7, 'Metal tools'),
    (8, 'Bottle of water'),
    (9, 'Plastic bottle, glass'),
    (10, 'Plate, plastic'),
    (11, 'Spoons, forks, plastic knives'),
    (12, 'Plastic box'),
    (13, 'Silver foil'),
    (14, 'Paper bags'),
    (15, 'Plastic bags + plastic bags'),
    (16, 'Styrofoam'),
    (17, 'Ice cream'),
    (18, 'Battery'),
    (19, 'Others'),
)


class Profile(models.Model):
    def __str__(self):
        return '%s' % self.user.username

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    ether_address = models.CharField(max_length=255, null=False)
    ref_id = models.IntegerField()
    fullname = models.CharField(max_length=255, null=True, default=None)
    phone = models.CharField(max_length=255, null=True, default=None)


class Product(models.Model):
    def __str__(self):
        return '%s' % self.name

    TYPE_CHOICES = (
        ('PAY_ONCE', 'Pay once'),
        ('SUBSCRIPTION', 'Subscription')
    )
    profile = models.ForeignKey(Profile, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=255, null=False)


class Image(models.Model):
    link = models.FileField(upload_to='img')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, default=None)
    status = models.CharField(max_length=30, choices=(
        ('VERIFYING', 'Verifying'),
        ('DONE', 'Done')),
                              default='VERIFYING')
    type = models.IntegerField(choices=IMAGE_TYPE_CHOISE, null=True, default=None)
    type_ai = models.IntegerField(null=True, default=2)
    score = models.FloatField(default=0, null=True)
    created = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created', '-id',)


class ImageProfile(models.Model):
    image = models.ForeignKey(Image, on_delete=models.CASCADE, related_name='image_profiles')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    type = models.IntegerField(choices=IMAGE_TYPE_CHOISE, null=True, default=None)

    class Meta:
        unique_together = ('image', 'profile')
        ordering = ('-id',)


class Firmware(models.Model):
    link = models.FileField(upload_to='firmware')
    version = models.CharField(max_length=30)
