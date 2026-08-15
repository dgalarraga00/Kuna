from django.shortcuts import render
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from .models import Ingrediente, Plato, Componente, TiempoComida, Plan, Paciente, Medicion
from .serializers import IngredienteSerializer, PlatoSerializer, ComponenteSerializer, TiempoComidaSerializer, PacienteSerializer, MedicionSerializer, PlanSerializer
from rest_framework import viewsets
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table
from reportlab.lib.styles import getSampleStyleSheet
from django.http import HttpResponse
from .filters import IngredienteFilter



# Create your views here.

@api_view(['GET'])
def comparar_plan(request, plan_id):
    plan = get_object_or_404(Plan,id=plan_id)
    reales_calorias = plan.calcular_totales_reales("calorias")
    reales_proteinas = plan.calcular_totales_reales("proteina")
    reales_carbohidratos = plan.calcular_totales_reales("carbohidratos")
    reales_grasas = plan.calcular_totales_reales("grasa_total")
    resultado = {
        "plan_id" : plan_id,
        "objetivo": {
            "kcal": plan.calorias_meta,
            "proteina": plan.g_proteina,
            "carbohidratos": plan.gramos_carbos,
            "grasas": plan.g_grasa
        },
        "reales": {
            'kcal': reales_calorias,
            "proteina": reales_proteinas,
            "carbohidratos": reales_carbohidratos,
            "grasas": reales_grasas
        },
        "faltantes": {
            "kcal":round(plan.calorias_meta - reales_calorias,2) if plan.calorias_meta is not None else None,
            "proteina": round(plan.g_proteina - reales_proteinas,2),
            "carbohidratos":round(plan.gramos_carbos - reales_carbohidratos,2) if plan.gramos_carbos is not None else None,
            "grasas": round(plan.g_grasa - reales_grasas,2),
        },
    }
    return Response(resultado)
 

class PlatoViewSet(viewsets.ModelViewSet):
    queryset = Plato.objects.prefetch_related("componentes__ingrediente")
    serializer_class = PlatoSerializer


class ComponenteViewSet(viewsets.ModelViewSet):
    queryset = Componente.objects.all()
    serializer_class = ComponenteSerializer
    filterset_fields = ['plato']
    
class TiempoComidaViewSet(viewsets.ModelViewSet):
    queryset = TiempoComida.objects.all()
    serializer_class = TiempoComidaSerializer
    filterset_fields = ['plan']

@api_view(['GET'])
def exportar_pdf(request, plan_id):
    plan = get_object_or_404(Plan,id=plan_id)
    response = HttpResponse(content_type="application/pdf")
    response["Content-Disposition"] = f"attachment; filename=plan_{plan_id}.pdf"

    doc = SimpleDocTemplate(response, pagesize=letter)
    styles = getSampleStyleSheet() 
    story = []

    story.append(Paragraph(f"Plan Nutricional - {plan.medicion.paciente}", styles['Title']))
    story.append(Paragraph(f"Objetivo: {plan.get_objetivo_plan_display()}", styles['Normal']))
    story.append(Spacer(1, 12))
    
    for comida in plan.comidas.all():
        story.append(Paragraph(comida.get_tipo_display(), styles['Heading2']))
        for plato in comida.platos.all():
            story.append(Paragraph(str(plato),styles['Normal']))
            for componente in plato.componentes.all():
                story.append(Paragraph(f"  {componente.ingrediente} - {componente.gramaje}g", styles['Normal']))
    doc.build(story)
    return response

    
class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.all()
    serializer_class = PacienteSerializer
class MedicionViewSet(viewsets.ModelViewSet):
    queryset = Medicion.objects.all()
    serializer_class = MedicionSerializer
    filterset_fields = ['paciente']

class PlanViewSet(viewsets.ModelViewSet):
    queryset = Plan.objects.all()
    serializer_class = PlanSerializer
    filterset_fields = ['medicion','activo','medicion__paciente']

class IngredienteViewSet(viewsets.ModelViewSet):
    queryset = Ingrediente.objects.all()
    serializer_class = IngredienteSerializer
    filterset_class = IngredienteFilter

    
    