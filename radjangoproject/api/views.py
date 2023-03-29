from rest_framework.response import Response
from rest_framework.decorators import api_view
from .rating import roomRate

@api_view(['GET'])
def getData(request):
    return Response("hi")

@api_view(['POST'])
def testPost(request):
    print(request.data)
    rating = roomRate(request.data)
    return Response(rating)
    #return Response("woah")