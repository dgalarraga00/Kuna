from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'platos', views.PlatoViewSet)
router.register(r'componentes', views.ComponenteViewSet)
router.register(r'tiempos_comida', views.TiempoComidaViewSet)
router.register(r'pacientes', views.PacienteViewSet)
router.register(r'mediciones', views.MedicionViewSet)
router.register(r'planes', views.PlanViewSet)
router.register(r'ingredientes', views.IngredienteViewSet)


urlpatterns = [
    
    path('planes/<int:plan_id>/comparar/', views.comparar_plan, name='comparar-plan'),
    path('planes/<int:plan_id>/pdf/', views.exportar_pdf, name='exportar-pdf'),
] + router.urls
  