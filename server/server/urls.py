"""server URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.urls import path
from . import views

urlpatterns = [
    path('login', views.login),
    path('signup', views.signup),
    path('get_user', views.get_user_by_token),
    path('itineraries', views.get_all_itineraries),
    path('create_itinerary', views.create_itinerary),
    path('itinerary/<str:id>', views.get_itinerary_by_id),
    path('my_itineraries', views.get_itinerary_by_user),
    path('edit_itinerary/<str:id>', views.edit_itinerary),
]
