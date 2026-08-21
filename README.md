# Kuna

Aplicación de gestión nutricional: permite llevar el historial de pacientes, registrar sus
mediciones antropométricas y construir planes alimentarios calculados a partir de esas
mediciones.

El sistema calcula automáticamente IMC, porcentaje de grasa corporal, gasto energético basal
y total, y a partir de ahí deriva los objetivos de calorías y macronutrientes del plan. Los
planes se arman con platos compuestos por ingredientes, y pueden exportarse a PDF.

## Stack

| Capa     | Tecnología                                              |
| -------- | ------------------------------------------------------- |
| Backend  | Django 6.1 · Django REST Framework · django-filter       |
| Frontend | React 19 · TypeScript · Vite · React Router              |
| Base     | SQLite                                                  |
| PDF      | ReportLab                                               |

## Estructura

```
Kuna/
├── backend/          API REST en Django
│   ├── api/          App principal: modelos, serializers, vistas, filtros
│   ├── kuna/         Configuración del proyecto
│   └── requirements.txt
└── frontend/         SPA en React + TypeScript
    └── src/
        ├── api/          Cliente HTTP centralizado
        ├── features/     Un módulo por dominio (pacientes, mediciones, planes, platos)
        └── utils/
```

## Requisitos

- Python 3.11 o superior
- Node.js 20 o superior
- pnpm

## Puesta en marcha

### Backend

```bash
cd backend
python3 -m venv env
source env/bin/activate          # Windows: env\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

La API queda disponible en `http://127.0.0.1:8000/api/`.

Para cargar el catálogo de alimentos locales incluido en el repositorio:

```bash
python manage.py loaddata api/fixtures/db_alimentos_locales.json
```

Para acceder al panel de administración de Django, crear un usuario:

```bash
python manage.py createsuperuser
```

#### Variables de entorno

En desarrollo el proyecto funciona sin configuración adicional. Para cualquier despliegue
real es obligatorio definir estas variables:

| Variable                | Descripción                                     | Valor por defecto |
| ----------------------- | ----------------------------------------------- | ----------------- |
| `DJANGO_SECRET_KEY`     | Clave secreta de Django                          | Clave insegura de desarrollo |
| `DJANGO_DEBUG`          | Modo debug (`true` / `false`)                    | `true`            |
| `DJANGO_ALLOWED_HOSTS`  | Hosts permitidos, separados por coma             | Vacío             |

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

La aplicación queda disponible en `http://localhost:5173`, que es el origen habilitado en la
configuración de CORS del backend. El backend debe estar corriendo para que la interfaz
tenga datos.

## API

Base: `/api/`

### Recursos

Todos exponen el CRUD completo mediante `ModelViewSet`.

| Endpoint            | Descripción                                    | Filtros disponibles                       |
| ------------------- | ---------------------------------------------- | ----------------------------------------- |
| `/pacientes/`       | Pacientes y su ficha clínica                    | —                                         |
| `/mediciones/`      | Mediciones antropométricas                      | `paciente`                                |
| `/planes/`          | Planes nutricionales                            | `medicion`, `activo`, `medicion__paciente` |
| `/tiempos_comida/`  | Tiempos de comida de un plan                    | `plan`                                    |
| `/platos/`          | Platos                                          | —                                         |
| `/componentes/`     | Ingredientes de un plato, con su gramaje        | `plato`                                   |
| `/ingredientes/`    | Catálogo de ingredientes y su tabla nutricional | `nombre` (contiene), `es_local`           |

### Acciones

| Endpoint                        | Método | Descripción                                                        |
| ------------------------------- | ------ | ------------------------------------------------------------------ |
| `/planes/<id>/comparar/`        | GET    | Compara los objetivos del plan contra los totales reales de sus platos |
| `/planes/<id>/pdf/`             | GET    | Exporta el plan nutricional a PDF                                  |

## Modelo de datos

```
Paciente ──< Medicion ──< Plan ──< TiempoComida >──< Plato ──< Componente >── Ingrediente
```

- **Paciente** — datos personales y ficha clínica (restricciones, alergias, enfermedades,
  medicamentos). La edad se deriva de la fecha de nacimiento.
- **Medicion** — peso, talla, tres pliegues cutáneos y nivel de actividad física en una fecha
  dada. Un paciente acumula mediciones a lo largo del tiempo.
- **Plan** — nace de una medición y de un objetivo (pérdida de peso, mantenimiento o ganancia
  muscular). Los objetivos de calorías y macros se calculan y persisten al crearlo.
- **TiempoComida** — desayuno, media mañana, almuerzo, media tarde o cena. Agrupa los platos
  de un plan y se ordena según el momento del día.
- **Plato** / **Componente** / **Ingrediente** — un plato se compone de ingredientes con un
  gramaje determinado; los macros del plato se calculan a partir de esa composición.

## Cálculos

Los valores derivados se exponen en la API como campos de solo lectura.

| Valor                        | Método                                                     |
| ---------------------------- | ---------------------------------------------------------- |
| IMC                          | `peso / talla²`                                            |
| Porcentaje de grasa          | Jackson-Pollock de 3 pliegues, con fórmula según sexo       |
| Gasto energético basal (GEB) | Mifflin-St Jeor                                             |
| Gasto energético total (GET) | GEB × factor de actividad física                            |
| Calorías objetivo            | GET × factor del objetivo del plan (0.8 / 1.0 / 1.2)        |
| Proteínas                    | 2 g por kg de peso corporal                                 |
| Grasas                       | 0.8 g por kg de peso corporal                               |
| Carbohidratos                | Calorías restantes tras descontar proteínas y grasas, ÷ 4   |

El cálculo del porcentaje de grasa y del gasto energético requiere que el paciente tenga
sexo definido (`M` o `F`); con sexo `N` estos valores devuelven `null`.

## Pendientes

- La URL del backend está fijada en `frontend/src/api/client.ts`. Para desplegar el frontend
  hay que moverla a una variable de entorno de Vite.
