from rest_framework import serializers
from .models import Ingrediente, Plato, Componente, TiempoComida, Paciente, Medicion, Plan

class IngredienteSerializer(serializers.ModelSerializer):
    class Meta :
        model = Ingrediente
        fields = '__all__' 
    
class PlatoSerializer(serializers.ModelSerializer):
    macros = serializers.SerializerMethodField()
    class Meta :
        model = Plato
        fields = '__all__' 
    def get_macros(self, obj):
        return {
            "calorias": obj.calcular_macros("calorias"),
            "proteina": obj.calcular_macros("proteina"),
            "carbohidratos": obj.calcular_macros("carbohidratos"),
            "grasa_total" : obj.calcular_macros("grasa_total"),
        }
    
class ComponenteSerializer(serializers.ModelSerializer):
    class Meta :
        model = Componente
        fields = '__all__' 
    
class TiempoComidaSerializer(serializers.ModelSerializer):
    class Meta:
         model =TiempoComida
         fields = '__all__'
         
class PacienteSerializer(serializers.ModelSerializer):
    edad = serializers.ReadOnlyField()
    class Meta:
        model = Paciente
        fields = '__all__' 
    
class MedicionSerializer(serializers.ModelSerializer):
    imc = serializers.ReadOnlyField()
    porcentaje_grasa = serializers.ReadOnlyField()
    geb = serializers.ReadOnlyField()
    gasto_total = serializers.ReadOnlyField()
    class Meta:
        model = Medicion
        fields = '__all__' 
    
class PlanSerializer(serializers.ModelSerializer):
    calorias_meta = serializers.ReadOnlyField()
    g_proteina = serializers.ReadOnlyField()
    g_grasa = serializers.ReadOnlyField()
    kcal_proteina = serializers.ReadOnlyField()
    kcal_grasa = serializers.ReadOnlyField()
    kcal_carbos = serializers.ReadOnlyField()
    gramos_carbos = serializers.ReadOnlyField()

    class Meta:
        model = Plan
        fields = '__all__' 
    