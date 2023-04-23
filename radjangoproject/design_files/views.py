from django.shortcuts import render
from django.http.response import JsonResponse

from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import DesignFileSerializer, RoomObjectSerializer
from .models import DesignFile, RoomObject

from .thumbnail_generator import *


@api_view(['GET', 'POST'])
def file_list(request):
    if request.method == 'GET':
        files = DesignFile.objects.all()
        serializer = DesignFileSerializer(files, many=True)
        return Response(serializer.data)
    elif request.method == 'POST':
        serializer = DesignFileSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save()

        return Response("file added")

@api_view(['GET', 'PUT', 'DELETE'])
def file_detail(request, fID):
    if request.method == 'GET':
        file = DesignFile.objects.get(fileID=fID)
        serializer = DesignFileSerializer(file, many=False)
        return Response(serializer.data)
    elif request.method == 'PUT':
        file = DesignFile.objects.get(fileID=fID)
        serializer = DesignFileSerializer(instance=file, data=request.data)

        if serializer.is_valid():
            serializer.save()

        return Response(serializer.data)
    elif request.method == 'DELETE':
        file = DesignFile.objects.get(fileID=fID)
        file.delete()
        return Response("File successfully deleted")


######

@api_view(['POST'])
def ro_delete_by_ids(request):
    for oID in request.data:
        roomObject = RoomObject.objects.get(uid=oID)
        roomObject.delete()
    return Response("Delete BY ID")


@api_view(['GET', 'DELETE'])
def ro_in_file(request, fID):
    if request.method == 'GET':
        roomObjects = RoomObject.objects.all().filter(fileID=fID)
        serializer = RoomObjectSerializer(roomObjects, many=True)
        return Response(serializer.data)
    elif request.method == 'DELETE':
        RoomObject.objects.filter(fileID=fID).delete()
        return Response("Objects at file id deleted")


@api_view(['GET', 'PUT', 'DELETE'])
def ro_detail(request, oID):
    if request.method == 'GET':
        roomObject = RoomObject.objects.get(uid=oID)
        serializer = RoomObjectSerializer(roomObject, many=False)
        return Response(serializer.data)
    elif request.method == 'PUT':
        roomObject = RoomObject.objects.get(uid=oID)
        serializer = RoomObjectSerializer(instance=roomObject, data=request.data)

        if serializer.is_valid():
            serializer.save()

        return Response(serializer.data)
    elif request.method == 'DELETE':
        roomObject = RoomObject.objects.get(uid=oID)
        roomObject.delete()
        return Response("File successfully deleted")


@api_view(['POST'])
def ro_create(request):
    serializer = RoomObjectSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()

    return Response("object added")


#####


@api_view(['GET'])
def get_thumbnail(request, fID):
    file = DesignFile.objects.get(fileID=fID)
    roomObjects = RoomObject.objects.all().filter(fileID=fID)
    tb_b64 = generate_thumbnail(825, 495, file.width, file.height, list(roomObjects))
    return Response(tb_b64)

