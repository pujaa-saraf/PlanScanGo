from rest_framework import serializers
from django.contrib.auth.models import User
from main.models import Itinerary

class UserSerializer(serializers.ModelSerializer):
    class Meta(object):
        model=User
        fields=['id', 'username', 'email']

# Add the itinerary model to the serializers.py file
class ItinerarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Itinerary
        fields = ['id', 'location', 'no_of_days', 'days', 'qr_code', 'qr_url']