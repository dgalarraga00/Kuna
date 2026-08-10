from rest_framework import serializers
from .models import Ingrediente, Plato, Componente, TiempoComida, Paciente, Medicion, Plan

class IngredienteSerializer(serializers.ModelSerializer):
    class Meta :
        model = Ingrediente
        fields = '__all__' 
    
class PlatoSerializer(serializers.ModelSerializer):
    class Meta :
        model = Plato
        fields = '__all__' 
    
class ComponenteSerializer(serializers.ModelSerializer):
    class Meta :
        model = Componente
        fields = '__all__' 
    
class TiempoComidaSerializer(serializers.ModelSerializer):
    class Meta:
         model =TiempoComida
         fields = '__all__'
         
class PacienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paciente
        fields = '__all__' 
    
class MedicionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medicion
        fields = '__all__' 
    
class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = '__all__' 
    