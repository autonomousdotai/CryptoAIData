from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from contract.owner_factory import OwnerTokenFactory
from django.template.defaultfilters import slugify


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

    profile = models.ForeignKey(Profile, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=255, null=False)


class Image(models.Model):
    link = models.FileField(upload_to='img')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, default=None)
    type_ai = models.IntegerField(null=True, default=2)
    score = models.FloatField(default=0, null=True)
    created = models.DateTimeField(auto_now=True)
    category = models.ForeignKey('Category', related_name='images', on_delete=models.CASCADE, null=True, default=None)
    classify = models.ForeignKey('Classify', related_name='images', on_delete=models.CASCADE, null=True, default=None)

    class Meta:
        ordering = ('-created', '-id',)


class ImageProfile(models.Model):
    image = models.ForeignKey(Image, on_delete=models.CASCADE, related_name='image_profiles')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    type = models.IntegerField(choices=(
        (1, 'Owner'),
        (2, 'Classify'),
    ), default=1)

    class Meta:
        ordering = ('-id',)


class Firmware(models.Model):
    link = models.FileField(upload_to='firmware')
    version = models.CharField(max_length=30)


class Category(models.Model):
    def __str__(self):
        return '%s' % self.name

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(Category, self).save(*args, **kwargs)

    name = models.CharField(max_length=255, null=False)
    slug = models.SlugField(max_length=255, default=None, null=True, db_index=True, blank=True)
    desc = models.CharField(max_length=255, null=True, default=None)
    contract_address = models.CharField(max_length=255, null=False)
    tx = models.CharField(max_length=255, null=False)
    created = models.DateTimeField(auto_now=True)


class Classify(models.Model):
    def __str__(self):
        return '%s' % self.name

    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='classifies')
    name = models.CharField(max_length=255, null=False)
    title = models.CharField(max_length=255, null=True, default=None)


@receiver(post_save, sender=Category)
def create_contract_category(sender, instance, created, **kwargs):
    if created:
        tx = OwnerTokenFactory(instance.name, instance.name.upper()[:6]).create_contract_tx_hash()
        instance.tx = tx
        instance.save()
