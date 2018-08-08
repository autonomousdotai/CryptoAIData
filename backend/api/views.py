import base64
import requests
import json
import os
import copy
from rest_framework.decorators import api_view
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework import status
from rest_framework.response import Response
from rest_framework import generics

from .models import Profile, Image, Product, Firmware, ImageProfile, Classify, Category, CategoryProfile, FollowingCategory, FollowingProfile, LikedImage, BuyDataset
from .serializers import ProfileSerializer, ProfileDetailSerializer, ImageDetailSerializer, ImageSerializer, \
    ProductSerializer, ProductDetailSerializer, FirmwareSerializer, FirmwareDetailSerializer, ImageProfileSerializer, \
    ImageProfileDetailSerializer, CategorySerializer, CategoryDetailSerializer, ClassifySerializer, \
    ClassifyDetailSerializer, WithdrawCreateSerializer, OscarUploadSerializer, FollowCategorySerializer, FollowProfileSerializer, LikeImageSerializer, BuyDatasetSerializer

from django.conf import settings
from django.contrib.auth.models import User
from web3 import Web3, TestRPCProvider, HTTPProvider
from web3 import Account
import django_filters.rest_framework
from api.filter import ImageFilter
from api.utils.ai.ai_model_wapper import ModelWrapper
from rest_framework import pagination
from django.db.models import Q
import threading
from api.utils.image import stream_to_ai_server, perform_create
from django_filters import rest_framework as filters
from contract.dataset_factory import DatasetFactory


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def user_signup(request):
    if 'password' not in request.data:
        return Response({"message": "Please enter password"}, status=status.HTTP_400_BAD_REQUEST)
    data = dict(
        (key, request.data.getlist(key) if len(request.data.getlist(key)) > 1 else request.data.getlist(key)[0]) for key
        in request.data.keys())
    data['password'] = base64.b64encode(data['password'].encode()).decode()

    response = requests.post(settings.AUTONOMOUS_API_SIGNUP, data=json.dumps(data),
                             headers={'content-type': "application/json"})

    if response.status_code != 200 or response.json()['status'] != 1:
        return Response({"message": response.json().get('message')}, status=status.HTTP_400_BAD_REQUEST)

    # Auto create investor
    user = User.objects.filter(username=response.json()['customer']['email']).first()
    if not user:
        user = User.objects.create_user(username=response.json()['customer']['email'])
    profile, _ = Profile.objects.get_or_create(user=user, ref_id=response.json()['customer']['id'])
    profile.ether_address = response.json()['customer']['ether_address']
    profile.save()
    res = response.json()['customer']
    res['id'] = profile.id
    return Response(res, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def user_signin(request):
    if 'password' not in request.data:
        return Response({"message": "Please enter password"}, status=status.HTTP_400_BAD_REQUEST)
    data = dict(
        (key, request.data.getlist(key) if len(request.data.getlist(key)) > 1 else request.data.getlist(key)[0]) for key
        in request.data.keys())
    data['password'] = base64.b64encode(data['password'].encode()).decode()

    response = requests.post(settings.AUTONOMOUS_API_AUTH, data=json.dumps(data),
                             headers={'content-type': "application/json"})

    if response.status_code != 200 or response.json()['status'] != 1:
        return Response({"message": response.json().get('message')}, status=status.HTTP_400_BAD_REQUEST)

    # Auto create investor
    user = User.objects.filter(username=data['email'])
    if not user:
        user = User.objects.create_user(username=data['email'])
    try:
        profile, _ = Profile.objects.get_or_create(user=user[0])
    except:
        profile, _ = Profile.objects.get_or_create(user=user)
    profile.ether_address = data['email']
    profile.save()
    res = response.json()['customer']
    res['id'] = profile.id
    res['ether_address'] = data['email']
    return Response(res, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def inc_balance_contract(request):
    if 'category_id' not in request.data or 'ether_address' not in request.data:
        return response(
            {
                "message": "missing required fields (category_id, ether_address) from payload."
            },
            status=status.http_400_bad_request
        )

    category_id = int(request.data['category_id'])
    cat = Category.objects.get(pk=category_id)
    if cat is None:
        return response(
            {
                "message": "category_id %d is invalid" % category_id
            },
            status=status.http_400_bad_request
        )

    contract_addr = cat.contract_addr
    if contract_addr is None:
        return response(
            {
                "message": "could not find contract address in category_id %" % category_id
            },
            status=status.http_400_bad_request
        )

    tx = Dataset(contract_addr).add_provider(ether_address, 1)
    return Response(
        {
            "tx": tx
        },
        status=status.HTTP_200_OK
    )


class WithdrawList(generics.CreateAPIView):
    serializer_class = WithdrawCreateSerializer

    def create(self, request, *args, **kwargs):
        to = request.data.get('address')
        c = Category.objects.get(pk=int(request.data.get('category')))
        cp = CategoryProfile.objects.get(profile=request.user.profile, category=c)
        amount = cp.balance

        with open('%s/contract/owner_contract_abi.json' % settings.BASE_DIR, 'r') as abi_definition:
            abi = json.load(abi_definition)

        w3 = Web3(HTTPProvider('https://rinkeby.infura.io/SKMV9xjeMbG3u7MnJHVH'))

        contract_checksum = w3.toChecksumAddress(c.contract_address)
        contract = w3.eth.contract(address=contract_checksum, abi=abi)

        unicorn_txn = contract.functions.add_amount(to, 1).buildTransaction({
            'value': 0,
            'gas': w3.toHex(1000000),
            'chainId': 4,
            'gasPrice': w3.toWei('500', 'gwei'),
            'nonce': w3.eth.getTransactionCount('0x6f212bF41DF64De9782dbfb26112BD3B0e39514B'),
            'from': os.environ['ADDRESS']
        })

        private_key = os.environ['PRIVATE_KEY']
        acct = Account.privateKeyToAccount(private_key)
        signed = acct.signTransaction(unicorn_txn)
        tx = w3.eth.sendRawTransaction(signed.rawTransaction)
        tx_hash = w3.toHex(tx)

        cp.balance = 0
        cp.save()
        return Response({"tx_hash": tx_hash}, status=status.HTTP_200_OK)


class OscarUpload(generics.CreateAPIView):
    serializer_class = OscarUploadSerializer

    def create(self, request, *args, **kwargs):
        file = request.FILES['link']
        data = file.read()
        file.seek(0)
        result_model = {'type_ai': 2, 'score': 0}
        t1 = threading.Thread(target=stream_to_ai_server, args=[result_model, data, 'type_ai', 'score'])
        t1.start()
        serializer = ImageDetailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        t2 = threading.Thread(target=lambda x: x.save(), args=[serializer])
        t2.start()

        file2 = request.FILES['link2']
        data2 = file2.read()
        file2.seek(0)
        result_model_2 = {'type_ai_2': 2, 'score_2': 0}
        t11 = threading.Thread(target=stream_to_ai_server, args=[result_model_2, data2, 'type_ai_2', 'score_2'])
        t11.start()
        request.data['link'] = request.data['link2']
        serializer_2 = ImageDetailSerializer(data=request.data)
        serializer_2.is_valid(raise_exception=True)
        t22 = threading.Thread(target=lambda x: x.save(), args=[serializer_2])
        t22.start()

        file3 = request.FILES['link3']
        data3 = file3.read()
        file3.seek(0)
        result_model_3 = {'type_ai_3': 2, 'score_3': 0}
        t111 = threading.Thread(target=stream_to_ai_server, args=[result_model_3, data3, 'type_ai_3', 'score_3'])
        t111.start()
        request.data['link'] = request.data['link3']
        serializer_3 = ImageDetailSerializer(data=request.data)
        serializer_3.is_valid(raise_exception=True)
        t222 = threading.Thread(target=lambda x: x.save(), args=[serializer_3])
        t222.start()

        t1.join()
        t2.join()
        t11.join()
        t22.join()
        t111.join()
        t222.join()

        serializer.instance.type_ai = result_model['type_ai']
        serializer.instance.score = result_model['score']
        serializer_2.instance.save()

        serializer_2.instance.type_ai = result_model_2['type_ai_2']
        serializer_2.instance.score = result_model_2['score_2']
        serializer_2.instance.save()

        serializer_3.instance.type_ai = result_model_3['type_ai_3']
        serializer_3.instance.score = result_model_3['score_3']
        serializer_3.instance.save()

        result_model.update(serializer.data)
        result_model.update(result_model_2)
        result_model.update(result_model_3)
        return Response(result_model, status=status.HTTP_200_OK)


class ProfileList(generics.ListCreateAPIView):
    http_method_names = ['get', 'head']
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer


class ProfileDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileDetailSerializer


class ImageList(generics.ListCreateAPIView):
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('category',)

    #  def get_queryset(self):
    #      user = self.request.user
    #      return Image.objects.filter(~Q(image_profiles__profile=user.profile))

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid()

        category_id = request.data.pop('category')[0]
        c = Category.objects.get(pk=category_id)

        if 'classify' in request.data:
            classify_id = request.data.pop('classify')[0]
            if classify_id is not None:
                cl = Classify.objects.get(pk=classify_id)
                serializer.save(profile=self.request.user.profile, category=c, classify=cl)
        else:
            serializer.save(profile=self.request.user.profile, category=c)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class ImageDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Image.objects.all()
    serializer_class = ImageDetailSerializer


class ProductList(generics.ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    def get_queryset(self):
        user = self.request.user
        return Product.objects.filter(profile=user.profile)

    def perform_create(self, serializer):
        return serializer.save(profile=self.request.user.profile)


class ProductDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductDetailSerializer


class FirmwareList(generics.ListCreateAPIView):
    queryset = Firmware.objects.all()
    serializer_class = FirmwareSerializer


class FirmwareDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Firmware.objects.all()
    serializer_class = FirmwareDetailSerializer


class ImageProfileList(generics.ListCreateAPIView):
    def get_queryset(self):
        user = self.request.user
        return ImageProfile.objects.filter(profile=user.profile)

    def perform_create(self, serializer):
        return serializer.save(profile=self.request.user.profile)

    queryset = ImageProfile.objects.all()
    serializer_class = ImageProfileSerializer


class ImageProfileDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = ImageProfile.objects.all()
    serializer_class = ImageProfileDetailSerializer


class CategoryList(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = []


class ExploreCategory(generics.ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = []

    def get_queryset(self):
        return Category.objects.filter(images__isnull=False).distinct()


class CategoryDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategoryDetailSerializer


class ClassifyList(generics.ListCreateAPIView):
    queryset = Classify.objects.all()
    serializer_class = ClassifySerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filter_fields = ('category',)


class ClassifyDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Classify.objects.all()
    serializer_class = ClassifyDetailSerializer


class FollowCategory(generics.CreateAPIView):
    serializer_class = FollowCategorySerializer

    def perform_create(self, serializer):
        profile = self.request.user.profile
        c = Category.objects.get(id=self.request.data['category'])
        return serializer.save(profile=self.request.user.profile, category=c)


class UnfollowCategory(generics.DestroyAPIView):
    serializer_class = FollowCategorySerializer

    def get_object(self):
        c = Category.objects.get(id=self.request.data['category'])
        return FollowingCategory.objects.filter(profile=self.request.user.profile, category=c)

    def perform_destroy(self, instance):
        return instance.delete()


class FollowProfile(generics.CreateAPIView):
    serializer_class = FollowProfileSerializer

    def perform_create(self, serializer):
        profile = self.request.user.profile
        fp = Profile.objects.get(id=self.request.data['profile_id'])
        return serializer.save(profile=self.request.user.profile, following_profile=fp)


class UnfollowProfile(generics.DestroyAPIView):
    serializer_class = FollowProfileSerializer

    def get_object(self):
        fp = Profile.objects.get(id=self.request.data['profile_id'])
        return FollowingProfile.objects.filter(profile=self.request.user.profile, following_profile=fp)

    def perform_destroy(self, instance):
        return instance.delete()


class Feed(generics.ListAPIView):
    serializer_class = ImageSerializer
    permission_classes = []

    def get_queryset(self):
        if self.request.user.is_authenticated is False:
            return Image.objects.all().order_by('-created')

        profile = self.request.user.profile
        fc = profile.following_categories.all()
        fp = profile.following_profiles.all()
        #  if len(fc) > 0 or len(fp) > 0:
        #      queryset = Image.objects.filter((Q(category__in=fc) | Q(profile__in=fp)) & ~Q(image_profiles__profile=self.request.user.profile)).order_by('-created')
        #  else:
        #      queryset = Image.objects.filter(~Q(image_profiles__profile=self.request.user.profile)).order_by('-created')
        #  return queryset

        #  queryset = (~Q(image_profiles__profile=self.request.user.profile))
        #  if len(fc) > 0 or len(fp) > 0:
        #      queryset |= ((Q(category__in=fc) | Q(profile__in=fp)) & ~Q(image_profiles__profile=self.request.user.profile))
        #  return Image.objects.filter(queryset).order_by('-created')

        return Image.objects.filter(~Q(image_profiles__profile=self.request.user.profile)).order_by('-created')


class Search(generics.ListAPIView):
    serializer_class = ImageSerializer

    def get_queryset(self):
        queryset = Image.objects.all()
        classify_ids = self.request.query_params.get('classify_ids', None)
        if classify_ids is not None:
            queryset = queryset.filter(classify__id__in=classify_ids.split(','))

        category_ids = self.request.query_params.get('category_ids', None)
        if category_ids is not None:
            queryset = queryset.filter(category__id__in=category_ids.split(','))

        return queryset.order_by('-created')


class LikeImage(generics.CreateAPIView):
    serializer_class = LikeImageSerializer

    def perform_create(self, serializer):
        profile = self.request.user.profile
        i = Image.objects.get(id=self.request.data['image'])
        return serializer.save(profile=self.request.user.profile, image=i)


class UnlikeImage(generics.DestroyAPIView):
    serializer_class = LikeImageSerializer

    def get_object(self):
        i = Image.objects.get(id=self.request.data['image'])
        return LikedImage.objects.filter(profile=self.request.user.profile, image=i)

    def perform_destroy(self, instance):
        return instance.delete()


class Search(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = []

    def get_queryset(self):
        q = self.request.query_params.get('q', None)
        if q is not None:
            queryset = Category.objects.filter(name__icontains=q)
        else:
            queryset = Category.objects.all()
        return queryset.order_by('-created')


class Buy(generics.CreateAPIView):
    serializer_class = BuyDatasetSerializer
    permission_classes = []

    def perform_create(self, serializer):
        profile = self.request.user.profile
        c = Category.objects.get(id=self.request.data['category'])
        tx = self.request.data['tx']
        #  email = self.request.data['email']
        return serializer.save(profile=self.request.user.profile, category=c, tx=tx)
