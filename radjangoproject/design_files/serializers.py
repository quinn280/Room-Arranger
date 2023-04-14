from rest_framework import serializers 
from .models import DesignFile, RoomObject
 
 
class DesignFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DesignFile
        fields = '__all__'


class RoomObjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomObject
        fields = '__all__'