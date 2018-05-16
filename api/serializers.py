from rest_framework import serializers
from .models import Profile, Image, Product, Firmware, ImageProfile
from requests_html import HTMLSession
from django.conf import settings
session = HTMLSession()


class ProfileSerializer(serializers.ModelSerializer):
    token_balance = serializers.SerializerMethodField()

    def get_token_balance(self, obj):
        balance = 0
        try:
            r = session.get('https://rinkeby.etherscan.io/token/%s?a=%s' % (settings.CONTRACT_ADDRESS ,obj.ether_address))
            balance = r.html.find('.table', first=True).find('td')[3].text.split()[0]
        except Exception as err:
            pass
        return int(balance)

    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ('user', )

    def create(self, validated_data):
        pass


class ProfileDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ('user', )


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
        read_only_fields = ('profile', 'type', )


class ProductDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('profile', 'type', )


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
