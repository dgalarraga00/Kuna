from django.test import TestCase
from api.models import Paciente, Medicion, Plan
from datetime import date
# Create your tests here.

class MotorCalculoTests(TestCase):
    def setUp(self):
        self.paciente = Paciente.objects.create(
            nombre="David",
            apellido="Galarraga",
            email="david.galarraga@hotmail.com",
            telefono="0989565654",
            fecha_nacimiento=date(1999,5,2),
            restricciones_alimentarias="Pescado",
            alergias_alimentarias="Pescado Mariscos Gluten",
            enfermedades_existentes="diabetes tipo 2",
            medicamentos_actuales="Insulina",
            sexo=Paciente.Sexo.MASCULINO,
            observaciones="Tiene manchas detras del cuello"
        )
        
        self.medicion = Medicion.objects.create(
            paciente=self.paciente,
            peso=70,
            talla=170,
            pliegue_1=10,
            pliegue_2=10,
            pliegue_3=10,
            actividad_fisica=Medicion.NivelActividad.MODERADO,
        )
        
        self.plan = Plan.objects.create(
            medicion=self.medicion,
            objetivo_plan=Plan.Objetivo.PERDIDA_PESO,
            calorias_objetivo=2500,
            proteinas_objetivo=200,
            carbohidratos_objetivo=300,
            grasas_objetivo=70,
            cantidad_agua=2500,
            observaciones="1era revision nutricional",
            activo=True,

        )
# esta es la funcion de prueba, le pasamos dos valores, lo que hace  codigo y lo que yo espero
    def test_geb_masculino(self):
        edad = self.paciente.edad
        geb_esperado = (10*70) + (6.25*170) - (5*edad) +5
        self.assertEqual(self.medicion.geb, round(geb_esperado,2))
    
        
