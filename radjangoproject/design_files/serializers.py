from rest_framework import serializers 
from .models import DesignFile
 
 
class DesignFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = DesignFile
        fields = '__all__'