from django.db import models
from datetime import date

# Modelo de cada paciente
class Paciente(models.Model):
    class Sexo(models.TextChoices):
        MASCULINO = "M", "Masculino"
        FEMENINO = "F", "Femenino"
        NINGUNO = "N", "Ninguno"

    nombre = models.CharField(max_length=50)
    apellido = models.CharField(max_length=50)
    email = models.EmailField(unique=True ,max_length=50)
    telefono  = models.CharField(max_length=15)
    fecha_nacimiento = models.DateField(null=False, blank=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    restricciones_alimentarias = models.TextField(verbose_name="Restricciones alimentarias", blank=True, default="")
    alergias_alimentarias = models.TextField(verbose_name="Alergias alimentarias", blank=True, default="")
    enfermedades_existentes = models.TextField(verbose_name="Enfermedades existentes", blank=True, default="")
    medicamentos_actuales = models.TextField(verbose_name="Medicamentos actuales", blank=True, default="")
    sexo = models.CharField(max_length=1, choices=Sexo.choices, default=Sexo.NINGUNO)
    observaciones = models.TextField(verbose_name="Observaciones", blank=True, default="")

    def __str__(self):
        return f'{self.nombre}, {self.apellido}'
    

    # Calcula la edad del paciente
    @property
    def edad(self):
        if self.fecha_nacimiento:
            hoy = date.today()
            return hoy.year - self.fecha_nacimiento.year - ((hoy.month, hoy.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day))
        return None

    # Ultima medicion cargada
    @property 
    def ultima_medicion(self):
        return self.mediciones.first()                       

    # Planes nutricionales del paciente, a traves de sus mediciones
    @property
    def planes(self):
        return Plan.objects.filter(medicion__paciente=self)

 
# Modelo de cada medicion. Registra los datos antropometricos de un paciente(peso, talla, pliegues, actividad).
class Medicion(models.Model):
    class NivelActividad(models.TextChoices):
        SEDENTARIO = "1.2", "Sedentario (sin ejercicio)"
        LIGERO = "1.375", "Ligero (ejercicio 1-3 días a la semana)"
        MODERADO = "1.55", "Moderado (ejercicio 3-5 días a la semana)"
        MUY_ACTIVO = "1.725", "Muy activo (ejercicio 6-7 días a la semana)"
        EXTREMADAMENTE_ACTIVO = "1.9", "Extremadamente activo (ejercicio intenso 2 veces al día)"

    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name="mediciones")
    fecha = models.DateField(default=date.today)
    peso = models.DecimalField(max_digits=5, decimal_places=2)
    talla = models.DecimalField(max_digits=5, decimal_places=2)
    pliegue_1 = models.DecimalField(max_digits=5, decimal_places=2)
    pliegue_2 = models.DecimalField(max_digits=5, decimal_places=2)
    pliegue_3 = models.DecimalField(max_digits=5, decimal_places=2)
    actividad_fisica = models.CharField(max_length=5, choices=NivelActividad.choices, default=NivelActividad.SEDENTARIO)

    class Meta:
        ordering = ["-fecha"]

    def __str__(self):
        return f"{self.paciente} - {self.fecha}"

    # Calcula el indice de masa corporal
    @property
    def imc(self):
        if not self.talla:
            return None
        imc = float(self.peso) / ((float(self.talla)/100)**2)
        return round(imc,2)

    # Calcula el porcentaje de grasa
    @property
    def porcentaje_grasa(self):
        edad = self.paciente.edad
        if edad is None:
            return None
        if self.paciente.sexo == Paciente.Sexo.MASCULINO:
            s = float(self.pliegue_1) + float(self.pliegue_2) + float(self.pliegue_3)
            dc = 1.109380 - (0.0008267 * s) + (0.0000016 * s**2) - (0.000257 * edad)
            gc = (495/dc) - 450
            return round(gc,2)
        elif self.paciente.sexo == Paciente.Sexo.FEMENINO:
            s = float(self.pliegue_1) + float(self.pliegue_2) + float(self.pliegue_3)
            dc = 1.0994921 - (0.0009929 * s) + (0.0000023 * s**2) - (0.0001392 * edad)
            gc = (495/dc) - 450
            return round(gc,2)
        else:
            return None

    # Calcula el GEB -> Gasto energético basal
    @property
    def geb(self):
        edad = self.paciente.edad
        if edad is None:
            return None
        if self.paciente.sexo == Paciente.Sexo.MASCULINO:
            geb = (10 * float(self.peso)) + (6.25 * float(self.talla)) - (5 * edad) + 5
        elif self.paciente.sexo == Paciente.Sexo.FEMENINO:
            geb = (10 * float(self.peso)) + (6.25 * float(self.talla)) - (5 * edad) - 161
        else:
            return None
        return round(geb,2)

    # Calcula el GET -> Gasto energético total
    @property
    def gasto_total(self):
        if self.geb is not None and self.actividad_fisica:
            get = float(self.geb) * float(self.actividad_fisica)
            return round(get,2)
        return None


# Modelo de cada ingrediente
class Ingrediente(models.Model):
    nombre = models.CharField(max_length=50)
    calorias = models.DecimalField(max_digits=6, decimal_places=2)
    proteina = models.DecimalField(max_digits=6, decimal_places=2)
    carbohidratos = models.DecimalField(max_digits=6, decimal_places=2)
    grasa_total = models.DecimalField(max_digits=6, decimal_places=2)
    fibra = models.DecimalField(max_digits=6, decimal_places=2)
    azucares = models.DecimalField(max_digits=6, decimal_places=2)
    grasa_saturada = models.DecimalField(max_digits=6, decimal_places=2)
    grasas_trans = models.DecimalField(max_digits=6, decimal_places=2)
    sodio = models.DecimalField(max_digits=8, decimal_places=2)
    potasio = models.DecimalField(max_digits=8, decimal_places=2)
    es_local = models.BooleanField(default=False)

    def __str__(self):
        return self.nombre
    


# Modelo de cada plato
class Plato(models.Model):
    nombre = models.CharField(max_length=50)
    preparacion = models.TextField(verbose_name="Preparacion", blank=True, default="")

    def calcular_macros(self, nombre_macro):
        total = 0 
        for componente in self.componentes.all():
            valor_base = getattr(componente.ingrediente, nombre_macro, 0)
            total += (float(valor_base)/100) * float(componente.gramaje)
        return round(total,2)


# Modelo de componente que relaciona el ingrediente con el plato
class Componente(models.Model):
    plato = models.ForeignKey(Plato, on_delete=models.CASCADE, related_name="componentes")
    ingrediente = models.ForeignKey(Ingrediente, on_delete=models.PROTECT)
    gramaje = models.DecimalField(max_digits=6, decimal_places=2)

#Modelo de Planes
class Plan(models.Model):
    class Objetivo(models.TextChoices):
        PERDIDA_PESO = "0.8", "Perdida de peso"
        MANTENIMIENTO = "1.0", "Mantenimiento"
        GANANCIA_MUSCULAR = "1.2", "Ganancia muscular"
    medicion = models.ForeignKey(Medicion, on_delete=models.PROTECT, related_name="planes")
    objetivo_plan = models.CharField(max_length=3, choices=Objetivo.choices)
    calorias_objetivo = models.DecimalField(max_digits=6, decimal_places=2, verbose_name = "Calorias del plan", blank=True, null=True)
    proteinas_objetivo = models.DecimalField(max_digits=6, decimal_places=2, verbose_name = "Proteinas del plan", blank=True, default=0)
    carbohidratos_objetivo = models.DecimalField(max_digits=6, decimal_places=2, verbose_name = "Carbohidratos del plan", blank=True, null=True)
    grasas_objetivo = models.DecimalField(max_digits=6, decimal_places=2, verbose_name = "Grasas del plan", blank=True, default=0)
    cantidad_agua = models.DecimalField(max_digits=6, decimal_places=2, verbose_name = "Cantidad de agua", blank=True, null=True)
    observaciones = models.TextField(verbose_name="Observaciones", blank=True, default="")
    activo = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Plan de {self.medicion.paciente} ({self.get_objetivo_plan_display()})"


    # El paciente se deriva de la medicion que originó el plan.
    @property
    def paciente(self):
        return self.medicion.paciente

     # Calcula el objetivo del paciente
    @property
    def calorias_meta(self):
        if self.medicion.gasto_total is not None and self.objetivo_plan:
            return round(float(self.medicion.gasto_total) * float(self.objetivo_plan),2)
        return None

    # Calcula los totales reales del paciente
    def calcular_totales_reales(self, nombre_macro):
        total = 0 
        for comida in self.comidas.all():
            total += comida.calcular_macros(nombre_macro)
        return round(total,2)

    # Calcula los gramos de proteína del paciente
    @property
    def g_proteina(self):
        gramos_proteina = float(self.medicion.peso) * 2
        return round(gramos_proteina,2)
    
    # Calcula los gramos de grasa del paciente
    @property
    def g_grasa(self):
        gramos_grasa = float(self.medicion.peso) * 0.8
        return round(gramos_grasa,2)

    # Calcula las kcal de las proteinas
    @property
    def kcal_proteina(self):
        kcal_prot = self.g_proteina * 4
        return round(kcal_prot,2)
    
    # Calcula las kcal de las grasas
    @property
    def kcal_grasa(self):
        kcal_gr = self.g_grasa * 9
        return round(kcal_gr,2)
    
    # Calcula las kcal de los carbohidratos
    @property
    def kcal_carbos(self):
        if self.calorias_meta is None:
            return None
        kcal_cho = self.calorias_meta - self.kcal_proteina - self.kcal_grasa
        if kcal_cho < 0:
            return None
        return round(kcal_cho,2)

    # Calcula los gramos de carbohidratos
    @property
    def gramos_carbos(self):
        if self.kcal_carbos is None:
            return None
        g_cho = self.kcal_carbos / 4
        return round(g_cho,2)

    # Creamos el poblado de los datos 
    # *args = Arguments(argumentos sin nombre)
    # **kwargs = Arguments(argumentos con nombre)
    def save(self, *args, **kwargs):
        if self.pk is None:
            self.calorias_objetivo = self.calorias_meta
            self.proteinas_objetivo = self.g_proteina
            self.carbohidratos_objetivo = self.gramos_carbos
            self.grasas_objetivo = self.g_grasa
        super().save(*args, **kwargs)
            

# Modelo de comidas que tiene relacion con plato
class TiempoComida(models.Model):
    class Tipo(models.TextChoices):
        DESAYUNO = "DES", "Desayuno"
        MEDIA_MANANA = "MM", "Media Mañana"
        ALMUERZO = "ALM", "Almuerzo"
        MEDIA_TARDE = "MT", "Media Tarde"
        CENA = "CEN", "Cena"
    
    plan = models.ForeignKey(Plan, on_delete=models.CASCADE, related_name="comidas")
    tipo = models.CharField(max_length=3, choices=Tipo.choices)
    platos =  models.ManyToManyField(Plato, related_name="tiempos_comida")



    def calcular_macros(self, nombre_macro):
        total = 0 
        for plato in self.platos.all():
            total += plato.calcular_macros(nombre_macro)
        return round(total,2)

