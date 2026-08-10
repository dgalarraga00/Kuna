from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'platos', views.PlatoViewSet)
router.register(r'componentes', views.ComponenteViewSet)
router.register(r'tiempos_comida', views.TiempoComidaViewSet)


urlpatterns = [
    path('ingredientes/', views.buscar_ingredientes, name='buscar-ingredientes'),
    path('planes/<int:plan_id>/comparar/', views.comparar_plan, name='comparar-plan'),
] + router.urls
  