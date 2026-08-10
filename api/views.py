from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Ingrediente
from .serializers import IngredienteSerializer

# Create your views here.
@api_view(['GET'])
def buscar_ingredientes(request): 
    query = request.GET.get('nombre','')
    ingredientes = Ingrediente.objects.filter(nombre__icontains=query)
    serializer = IngredienteSerializer(ingredientes, many=True)
    return Response(serializer.data)