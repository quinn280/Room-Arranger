from django.shortcuts import render
from django.http.response import JsonResponse

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import DesignFileSerializer, RoomObjectSerializer
from .models import DesignFile, RoomObject


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
    serializer = DesignFileSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()

    print(serializer.data)

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


######


@api_view(['GET'])
def ro_list(request):
    roomObjects = RoomObject.objects.all()
    serializer = RoomObjectSerializer(roomObjects, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def ro_detail(request, oID):
    roomObject = RoomObject.objects.get(uid=oID)
    serializer = RoomObjectSerializer(roomObject, many=False)
    return Response(serializer.data)


@api_view(['POST'])
def ro_create(request):
    serializer = RoomObjectSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()

    print(serializer.data)

    return Response("object added")


@api_view(['POST'])
def ro_update(request, oID):
    roomObject = DesignFile.objects.get(uid=oID)
    serializer = RoomObjectSerializer(instance=roomObject, data=request.data)

    if serializer.is_valid():
        serializer.save()

    return Response(serializer.data)


@api_view(['DELETE'])
def ro_delete(request, oID):
    roomObject = DesignFile.objects.get(uid=oID)
    roomObject.delete()
    return Response("File successfully deleted")