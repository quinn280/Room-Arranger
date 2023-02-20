from django.contrib import admin
from django.urls import path
from django.http import HttpResponse

def home(request):
    return HttpResponse('<h1>Room Arranger Project 1</h1>')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home),
]
