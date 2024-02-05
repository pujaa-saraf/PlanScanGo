from rest_framework.decorators import api_view
from rest_framework.response import Response

from main.models import Itinerary

from .serializers import UserSerializer, ItinerarySerializer
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User

from django.shortcuts import get_object_or_404

from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
def login(request):
    user=get_object_or_404(User, username=request.data['username'])
    if not user.check_password(request.data['password']):
        return Response({"detail":"Not found."}, status=status.HTTP_400_BAD_REQUEST)
    token, created=Token.objects.get_or_create(user=user)
    serializer=UserSerializer(instance=user)
    return Response({"token":token.key, "user":serializer.data})

@api_view(['POST'])
def signup(request):
    serializer=UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        user=User.objects.get(username=request.data['username'])
        user.set_password(request.data['password'])
        user.save()
        token=Token.objects.create(user=user)
        return Response({"token":token.key, "user":serializer.data})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@authentication_classes([SessionAuthentication,TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_user_by_token(request):
    user = request.user
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['POST'])
@authentication_classes([SessionAuthentication,TokenAuthentication])
@permission_classes([IsAuthenticated])
def create_itinerary(request):
    serializer=ItinerarySerializer(data=request.data)
    if serializer.is_valid():
        itinerary = serializer.save(user=request.user)
        itinerary.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_all_itineraries(request):
    itineraries = Itinerary.objects.all()
    serializer = ItinerarySerializer(itineraries, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@authentication_classes([SessionAuthentication,TokenAuthentication])
@permission_classes([IsAuthenticated])
def get_itinerary_by_user(request):
    itineraries = Itinerary.objects.filter(user=request.user)
    serializer = ItinerarySerializer(itineraries, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_itinerary_by_id(request, id):
    itinerary=get_object_or_404(Itinerary, id=id)
    serializer=ItinerarySerializer(instance=itinerary)
    return Response(serializer.data)

@api_view(['PUT'])
@authentication_classes([SessionAuthentication,TokenAuthentication])
@permission_classes([IsAuthenticated])
def edit_itinerary(request, id):
    itinerary = get_object_or_404(Itinerary, id=id)
    serializer = ItinerarySerializer(instance=itinerary, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)