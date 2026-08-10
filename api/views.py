from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Ingrediente, Plato, Componente
from .serializers import IngredienteSerializer, PlatoSerializer, ComponenteSerializer
from rest_framework import viewsets

# Create your views here.
@api_view(['GET'])
def buscar_ingredientes(request): 
    query = request.GET.get('nombre','')
    ingredientes = Ingrediente.objects.filter(nombre__icontains=query)
    serializer = IngredienteSerializer(ingredientes, many=True)
    return Response(serializer.data)

class PlatoViewSet(viewsets.ModelViewSet):
    queryset = Plato.objects.all()
    serializer_class = PlatoSerializer

class ComponenteViewSet(viewsets.ModelViewSet):
    queryset = Componente.objects.all()
    serializer_class = ComponenteSerializer
    