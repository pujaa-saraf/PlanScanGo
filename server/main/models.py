from django.db import models
from django.contrib.auth.models import User

class Itinerary(models.Model):
    location = models.CharField(max_length=100)
    no_of_days = models.IntegerField()
    days = models.JSONField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    qr_code = models.CharField(max_length=100) 
    qr_url=models.CharField(max_length=1000)
