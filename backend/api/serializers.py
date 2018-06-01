from rest_framework import serializers
from .models import Profile, Image, Product, Firmware, ImageProfile, Category, Classify
import requests


class ProfileSerializer(serializers.ModelSerializer):
    email = serializers.SerializerMethodField()

    def get_email(self, obj):
        return obj.user.username

    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ('user',)


class ProfileDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ('user',)


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Image
        fields = '__all__'


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
    point = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()

    def get_point(self, obj):
        balance = 0
        return int(balance)

    def get_image_url(self, obj):
        return obj.image.link.url

    class Meta:
        model = ImageProfile
        fields = '__all__'
        read_only_fields = ('profile',)


class ImageProfileDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImageProfile
        fields = '__all__'


class CategorySerializer(serializers.ModelSerializer):
    total_images = serializers.SerializerMethodField()
    img_present = serializers.SerializerMethodField()
    contract_address = serializers.SerializerMethodField()

    def get_total_images(self, obj):
        return obj.images.count()

    def get_img_present(self, obj):
        img = obj.images.order_by('id').first()
        url = 'https://lh3.googleusercontent.com/-7AQtXjvEm48/U7pPOjP28XI/AAAAAAAADqs/gssorSrOl1wxxraa0BmQhhAWzjTu4qVMQCJkCGAYYCw/s1000-fcrop64=1,17ce2bc4fc98ffff/451660716.jpg'
        if img:
            url = img.link.url
        return url

    def get_contract_address(self, obj):
        if not obj.contract_address:
            try:
                r = requests.get(
                    'https://api-rinkeby.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=%s&apikey=YourApiKeyToken' % obj.tx)
                obj.contract_address = r.json()['result']['contractAddress']
                obj.save()
            except Exception:
                pass
        return obj.contract_address

    class Meta:
        model = Category
        fields = '__all__'


class CategoryDetailSerializer(serializers.ModelSerializer):
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
