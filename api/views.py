from django.shortcuts import render
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .models import Ingrediente, Plato, Componente, TiempoComida, Plan
from .serializers import IngredienteSerializer, PlatoSerializer, ComponenteSerializer, TiempoComidaSerializer
from rest_framework import viewsets

# Create your views here.
@api_view(['GET'])
def buscar_ingredientes(request): 
    query = request.GET.get('nombre','')
    ingredientes = Ingrediente.objects.filter(nombre__icontains=query)
    serializer = IngredienteSerializer(ingredientes, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def comparar_plan(request, plan_id):
    plan = get_object_or_404(Plan,id=plan_id)
    reales_calorias = plan.calcular_totales_reales("calorias")
    reales_proteinas = plan.calcular_totales_reales("proteina")
    reales_carbohidratos = plan.calcular_totales_reales("carbohidratos")
    reales_grasas = plan.calcular_totales_reales("grasa_total")
    resultado = {
        "plan_id" : plan_id,
        "objetivo": {
            "kcal": plan.calorias_meta,
            "proteina": plan.g_proteina,
            "carbohidratos": plan.gramos_carbos,
            "grasas": plan.g_grasa
        },
        "reales": {
            'kcal': reales_calorias,
            "proteina": reales_proteinas,
            "carbohidratos": reales_carbohidratos,
            "grasas": reales_grasas
        },
        "faltantes": {
            "kcal":round(plan.calorias_meta - reales_calorias,2) if plan.calorias_meta is not None else None,
            "proteina": plan.g_proteina - reales_proteinas,
            "carbohidratos":round(plan.gramos_carbos - reales_carbohidratos,2) if plan.gramos_carbos is not None else None,
            "grasas": plan.g_grasa - reales_grasas
        },
    }
    return Response(resultado)
 

class PlatoViewSet(viewsets.ModelViewSet):
    queryset = Plato.objects.all()
    serializer_class = PlatoSerializer

class ComponenteViewSet(viewsets.ModelViewSet):
    queryset = Componente.objects.all()
    serializer_class = ComponenteSerializer
    
class TiempoComidaViewSet(viewsets.ModelViewSet):
    queryset = TiempoComida.objects.all()
    serializer_class = TiempoComidaSerializer