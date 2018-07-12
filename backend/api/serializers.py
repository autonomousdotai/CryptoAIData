from rest_framework import serializers
from .models import Profile, Image, Product, Firmware, ImageProfile, Category, Classify, CategoryProfile, FollowingCategory, FollowingProfile, LikedImage, BuyDataset
import requests

DEFAULT_IMAGE_URL = 'https://lh3.googleusercontent.com/-7AQtXjvEm48/U7pPOjP28XI/AAAAAAAADqs/gssorSrOl1wxxraa0BmQhhAWzjTu4qVMQCJkCGAYYCw/s1000-fcrop64=1,17ce2bc4fc98ffff/451660716.jpg'

class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.SerializerMethodField()

    def get_email(self, obj):
        return obj.user.username

    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ('user',)


class ProfileDetailSerializer(serializers.ModelSerializer):
    categories = serializers.SerializerMethodField()
    total_upload_images = serializers.SerializerMethodField()

    def get_total_upload_images(self, obj):
        return Image.objects.filter(profile=obj).count()

    def get_categories(self, obj):
        categories = Category.objects.all()
        res = []
        for c in categories:
            total_image = c.images.count()
            total_classify = c.images.filter(image_profiles__profile=obj).count()
            if c.images.count() > 0 and total_classify > 0:
                balance = CategoryProfile.objects.get(profile=obj, category=c).balance
                res.append(
                    {"total_image": total_image,
                     "total_classify": total_classify,
                     "contract": c.contract_address,
                     "name": c.name,
                     "category_id": c.id,
                     "balance": balance
                     })
        return res

    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ('user',)



class ImageDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('profile', 'type',)


class ProductDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('profile', 'type',)


class FirmwareSerializer(serializers.ModelSerializer):
    class Meta:
        model = Firmware
        fields = '__all__'


class FirmwareDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Firmware
        fields = '__all__'


class ImageProfileSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField(read_only=True)
    category_name = serializers.SerializerMethodField(read_only=True)
    classify_name = serializers.SerializerMethodField(read_only=True)

    def get_image_url(self, obj):
        return obj.image.link.url

    def get_category_name(self, obj):
        if obj.image.category:
            return obj.image.category.name
        return ''

    def get_classify_name(self, obj):
        if obj.classify:
            return obj.classify.name
        return ''

    class Meta:
        model = ImageProfile
        fields = '__all__'
        read_only_fields = ('profile', 'image_url', 'category_name', 'classify_name',)


class ImageProfileDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageProfile
        fields = '__all__'
        read_only_fields = ('profile',)


class FollowedCategoryField(serializers.BooleanField):

    def get_attribute(self, instance):
        if self.context['request'].user.is_authenticated is False:
            return False
        return FollowingCategory.objects.filter(profile=self.context['request'].user.profile, category=instance).exists()


class CategorySerializer(serializers.ModelSerializer):
    total_images = serializers.SerializerMethodField()
    display_images = serializers.SerializerMethodField()
    #  contract_address = serializers.SerializerMethodField()
    followed = FollowedCategoryField(read_only=True)
    classifies = serializers.SerializerMethodField()

    def get_classifies(self, obj):
        classifies = []
        for c in Classify.objects.filter(category=obj).all():
            classifies.append({
                'id': c.id,
                'name': c.name
            })
        return classifies

    def get_total_images(self, obj):
        return obj.images.count()

    def get_display_images(self, obj):
        img = obj.images.order_by('id').first()
        images = obj.images.order_by('id')[:3]
        urls = []
        if len(images) == 0:
            urls.append(DEFAULT_IMAGE_URL)
        else:
            for image in images:
                urls.append(image.link.url)
        return urls

    #  def get_contract_address(self, obj):
    #      if not obj.contract_address:
    #          try:
    #              r = requests.get(
    #                  'https://api-rinkeby.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=%s&apikey=YourApiKeyToken' % obj.tx)
    #              obj.contract_address = r.json()['result']['contractAddress']
    #              obj.save()
    #          except Exception:
    #              pass
    #      return obj.contract_address

    class Meta:
        model = Category
        fields = '__all__'


class CategoryDetailSerializer(serializers.ModelSerializer):
    total_followers = serializers.SerializerMethodField()
    total_images = serializers.SerializerMethodField()

    def get_total_images(self, obj):
        return Image.objects.filter(category=obj).count()

    def get_total_followers(self, obj):
        return FollowingCategory.objects.filter(category=obj).count()

    class Meta:
        model = Category
        fields = '__all__'


class ClassifySerializer(serializers.ModelSerializer):
    class Meta:
        model = Classify
        fields = '__all__'


class ClassifyDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Classify
        fields = '__all__'


class WithdrawCreateSerializer(serializers.Serializer):
    address = serializers.CharField()
    category = serializers.IntegerField()


class OscarUploadSerializer(serializers.Serializer):
    link = serializers.FileField()
    link2 = serializers.FileField()
    link3 = serializers.FileField()
    category = serializers.IntegerField()


class FollowCategorySerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        obj, _ = FollowingCategory.objects.get_or_create(
            profile=validated_data['profile'],
            category=validated_data['category']
        )
        return obj

    class Meta:
        model = FollowingCategory
        fields = '__all__'
        read_only_fields = ('profile',)


class FollowProfileSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        obj, _ = FollowingProfile.objects.get_or_create(
            profile=validated_data['profile'],
            following_profile=validated_data['following_profile']
        )
        return obj

    class Meta:
        model = FollowingProfile
        fields = '__all__'
        read_only_fields = ('profile', 'following_profile')


class LikeImageSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        obj, _ = LikedImage.objects.get_or_create(
            profile=validated_data['profile'],
            image=validated_data['image']
        )
        return obj

    class Meta:
        model = LikedImage
        fields = '__all__'
        read_only_fields = ('profile', 'image')


class LikedImageField(serializers.BooleanField):

    def get_attribute(self, instance):
        if self.context['request'].user.is_authenticated is False:
            return False
        return LikedImage.objects.filter(profile=self.context['request'].user.profile, image=instance).exists()


class ImageSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    classify = ClassifySerializer(read_only=True)
    liked = LikedImageField()

    def create(self, validated_data):
        if 'classify' not in validated_data:
            return Image.objects.create(
                link=validated_data['link'],
                profile=validated_data['profile'],
                category=validated_data['category'],
            )
        else:
            return Image.objects.create(
                link=validated_data['link'],
                profile=validated_data['profile'],
                category=validated_data['category'],
                classify=validated_data['classify'],
            )

    class Meta:
        model = Image
        fields = '__all__'
        #  depth = 2


class BuyDatasetSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        obj, _ = BuyDataset.objects.get_or_create(
            profile=validated_data['profile'],
            category=validated_data['category'],
            tx=validated_data['tx']
        )
        return obj

    class Meta:
        model = BuyDataset
        fields = '__all__'
        read_only_fields = ('profile', 'image')
