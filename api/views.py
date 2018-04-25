import base64
import requests
import json

from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Profile
from rest_framework import generics
from django.conf import settings
from rest_framework.decorators import authentication_classes, permission_classes
from django.http import Http404
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth.models import User


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
    user = User.objects.filter(username=response.json()['data']['customer']['email'])
    if not user:
        user = User.objects.create_user(username=response.json()['data']['customer']['email'])
    Profile.objects.get_or_create(user=user)
    return Response(response.json()['data']['customer'], status=status.HTTP_201_CREATED)


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
    user = User.objects.filter(username=response.json()['data']['customer']['email']).first()
    if not user:
        user = User.objects.create_user(username=response.json()['data']['customer']['email'])
    Profile.objects.get_or_create(user=user)

    return Response(response.json()['data']['customer'], status=status.HTTP_201_CREATED)
