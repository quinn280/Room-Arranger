from django.shortcuts import render
from django.http.response import JsonResponse

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import DesignFileSerializer
from .models import DesignFile


@api_view(['GET'])
def file_list(request):
    files = DesignFile.objects.all()
    serializer = DesignFileSerializer(files, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def file_detail(request, fID):
    file = DesignFile.objects.get(fileID=fID)
    serializer = DesignFileSerializer(file, many=False)
    return Response(serializer.data)


@api_view(['POST'])
def file_create(request):
    print('###')
    print(request.data)
    print('###')
    serializer = DesignFileSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()

    print('---')
    print(serializer.data)
    print('---')

    return Response("file added")


@api_view(['POST'])
def file_update(request, fID):
    file = DesignFile.objects.get(fileID=fID)
    serializer = DesignFileSerializer(instance=file, data=request.data)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)


@api_view(['DELETE'])
def file_delete(request, fID):
    file = DesignFile.objects.get(fileID=fID)
    file.delete()
    return Response("File successfully deleted")

