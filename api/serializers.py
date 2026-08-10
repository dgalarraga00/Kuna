from rest_framework import serializers
from .models import Ingrediente, Plato, Componente, TiempoComida

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
         
    