from django.urls import path
from . import views

urlpatterns = [
    path('ingredientes/', views.buscar_ingredientes, name='buscar-ingredientes')
]
