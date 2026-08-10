from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'platos', views.PlatoViewSet)
router.register(r'componentes', views.ComponenteViewSet)


urlpatterns = [
    path('ingredientes/', views.buscar_ingredientes, name='buscar-ingredientes'),
] + router.urls
 