from django.contrib import admin
from django.urls import path
from django.http import HttpResponse

from app1 import views as app1_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', app1_views.home),
    path('about/', app1_views.about),
    path('rules/', app1_views.rules)
]
