import django_filters
from .models import Ingrediente


class IngredienteFilter(django_filters.FilterSet):
    nombre = django_filters.CharFilter(lookup_expr='icontains')

    class Meta:
        model = Ingrediente
        fields = ['nombre', 'es_local']
   