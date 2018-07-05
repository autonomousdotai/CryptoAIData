from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from contract.owner_factory import OwnerTokenFactory
from contract.dataset_factory import DatasetFactory
from django.template.defaultfilters import slugify


class Profile(models.Model):
    def __str__(self):
        return '%s' % self.user.username

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    ether_address = models.CharField(max_length=255, null=False)
    ref_id = models.IntegerField()
    fullname = models.CharField(max_length=255, null=True, default=None)
    phone = models.CharField(max_length=255, null=True, default=None)
    following_categories = models.ManyToManyField('Category', through='FollowingCategory')
    following_profiles = models.ManyToManyField('Profile', through='FollowingProfile')
    liked_images = models.ManyToManyField('Image', related_name='liked_images', through='LikedImage')


class Product(models.Model):
    def __str__(self):
        return '%s' % self.name

    profile = models.ForeignKey(Profile, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=255, null=False)


def category_path(instance, filename):
    return '{0}/{1}'.format(instance.category.id, filename)


class Image(models.Model):
    link = models.FileField(upload_to=category_path)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, null=True, default=None)
    type_ai = models.IntegerField(null=True, default=2)
    score = models.FloatField(default=0, null=True)
    created = models.DateTimeField(auto_now=True)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, null=True, default=None)
    category = models.ForeignKey('Category', related_name='images', on_delete=models.CASCADE, null=True, default=None)
    classify = models.ForeignKey('Classify', related_name='images', on_delete=models.CASCADE, null=True, default=None)
    tx = models.CharField(max_length=255, null=True, default=None)

    class Meta:
        ordering = ('-created', '-id',)


class ImageProfile(models.Model):
    image = models.ForeignKey(Image, on_delete=models.CASCADE, related_name='image_profiles')
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    classify = models.ForeignKey('Classify', on_delete=models.CASCADE, null=True, default=None)
    tx = models.CharField(max_length=255, null=True, default=None)

    class Meta:
        ordering = ('-id',)


class Firmware(models.Model):
    link = models.FileField(upload_to='firmware')
    version = models.CharField(max_length=30)


class Category(models.Model):
    def __str__(self):
        return '%s' % self.name

    class Meta:
        ordering = ('-id', )

    def save(self, *args, **kwargs):
        self.slug = slugify(self.name)
        super(Category, self).save(*args, **kwargs)

    name = models.CharField(max_length=255, null=False)
    slug = models.SlugField(max_length=255, default=None, null=True, db_index=True, blank=True)
    desc = models.CharField(max_length=255, null=True, default=None)
    #  contract_address = models.CharField(max_length=255, null=True, blank=True)
    tx = models.CharField(max_length=255, null=True, default=None)
    created = models.DateTimeField(auto_now=True)
    created_by_id = models.IntegerField(null=True)
    request_goal = models.IntegerField(null=False, default=0)
    request_eth_amount = models.BigIntegerField(null=True, default=0)


class Classify(models.Model):
    def __str__(self):
        return '%s' % self.name

    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='classifies')
    name = models.CharField(max_length=255, null=False)
    title = models.CharField(max_length=255, null=True, default=None)


class CategoryProfile(models.Model):
    balance = models.FloatField(null=False, default=0)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)


@receiver(post_save, sender=ImageProfile)
def inc_balance(sender, instance, created, **kwargs):
    if created:
        cp, _ = CategoryProfile.objects.get_or_create(category=instance.image.category, profile=instance.profile)
        cp.balance += 1
        cp.save()

        tx = DatasetFactory().add_provider(instance.image.category.id, instance.profile.ether_address, 1)
        instance.tx = tx
        instance.save()


#  @receiver(post_save, sender=Category)
#  def create_contract_category(sender, instance, created, **kwargs):
#      if created:
#          tx = OwnerTokenFactory(instance.name, instance.name.upper()[:6]).create_contract_tx_hash()
#          instance.tx = tx
#          instance.save()


@receiver(post_save, sender=Category)
def add_category_dataset(sender, instance, created, **kwargs):
    if created:
        created_by_type = 1
        if (instance.request_goal > 0):
            created_by_type = 0
        tx = DatasetFactory().add_dataset(instance.id, created_by_type, instance.request_goal)
        instance.tx = tx
        instance.save()


@receiver(post_save, sender=Image)
def inc_balance(sender, instance, created, **kwargs):
    if created:
        cp, _ = CategoryProfile.objects.get_or_create(category=instance.category, profile=instance.profile)
        cp.balance += 1
        cp.save()

        tx = DatasetFactory().add_provider(instance.category.id, instance.profile.ether_address, 1)
        instance.tx = tx
        instance.save()


class FollowingCategory(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (("profile", "category"),)
        ordering = ('-created',)


class FollowingProfile(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    following_profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='following_profile')
    created = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (("profile", "following_profile"),)
        ordering = ('-created',)


class LikedImage(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE)
    image = models.ForeignKey(Image, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = (("profile", "image"),)
        ordering = ('-created',)
