from rest_framework import serializers
from .models import Ingrediente, Plato, Componente

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
    