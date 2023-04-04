from rest_framework.response import Response
from rest_framework.decorators import api_view
from .furn_rec import *
import json


@api_view(['GET'])
def getData(request):
    return Response("hi")

@api_view(['POST'])
def testPost(request):
    print(request.data)
    return Response("woah")

@api_view(['POST'])
def recommendFurniture(request):
    print(request.data)
    stuff = returnSomeStuff(request.data)
    responseJSON = json.dumps(stuff)
    return Response(responseJSON)