from django.contrib import admin
from .models import Ingrediente
# Register your models here.
@admin.register(Ingrediente)
class IngredienteAdmin(admin.ModelAdmin):
    list_display =("nombre", "calorias", "proteina", "carbohidratos", "grasa_total", "fibra", "azucares", "grasa_saturada", "grasas_trans", "sodio", "potasio", "es_local")
    search_fields=("nombre",)
    list_filter=("es_local",)
