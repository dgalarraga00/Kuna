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

Para cargar el catálogo incluido en el repositorio (158 ingredientes, 5 platos y sus
componentes):

```bash
python manage.py loaddata api/fixtures/catalogo.json
```

El fixture contiene únicamente datos de catálogo. Pacientes, mediciones y planes son datos
personales y por eso no se versionan.

Para acceder al panel de administración de Django, crear un usuario:

```bash
python manage.py createsuperuser
```

#### Variables de entorno

En desarrollo el proyecto funciona sin configuración adicional. Para cualquier despliegue
real es obligatorio definir estas variables:

| Variable                       | Descripción                                              | Valor por defecto |
| ------------------------------ | -------------------------------------------------------- | ----------------- |
| `DJANGO_SECRET_KEY`            | Clave secreta de Django                                   | Clave insegura de desarrollo |
| `DJANGO_DEBUG`                 | Modo debug (`true` / `false`)                             | `true`            |
| `DJANGO_ALLOWED_HOSTS`         | Hosts permitidos, separados por coma                      | Vacío             |
| `DATABASE_URL`                 | Cadena de conexión a Postgres                             | SQLite local      |
| `DJANGO_CORS_ALLOWED_ORIGINS`  | Orígenes del frontend habilitados, separados por coma     | `http://localhost:5173` |
| `DJANGO_CSRF_TRUSTED_ORIGINS`  | Orígenes confiables para CSRF, separados por coma         | Vacío             |

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

La aplicación queda disponible en `http://localhost:5173`, que es el origen habilitado por
defecto en la configuración de CORS del backend. El backend debe estar corriendo para que la
interfaz tenga datos.

#### Variables de entorno

| Variable       | Descripción                                  | Valor por defecto              |
| -------------- | -------------------------------------------- | ------------------------------ |
| `VITE_API_URL` | URL base de la API, con el prefijo `/api`    | `http://127.0.0.1:8000/api`    |

Vite resuelve esta variable en tiempo de build: si cambia, hay que volver a desplegar.

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

## Despliegue

| Componente | Plataforma | Configuración |
| ---------- | ---------- | ------------- |
| Base de datos | Neon | Postgres gestionado |
| Backend | Render | Definido en `render.yaml` |
| Frontend | Vercel | Definido en `frontend/vercel.json` |

### Neon

Crear el proyecto y copiar la cadena de conexión: ese es el valor de `DATABASE_URL` en
Render.

Neon ofrece dos endpoints. Para este backend conviene el **directo**, porque Django mantiene
conexiones persistentes (`conn_max_age`) y no necesita un pooler externo. Si aun así se usa
el endpoint agrupado —el que lleva `-pooler` en el host—, `settings.py` lo detecta y
desactiva los cursores del lado del servidor: ese endpoint es PgBouncer en modo transacción,
donde un cursor no sobrevive de una transacción a la siguiente.

El cómputo se suspende tras unos minutos sin actividad y vuelve a levantarse en la siguiente
conexión. Por eso la configuración activa `conn_health_checks`: Django verifica la conexión
antes de reutilizarla y reconecta si el servidor se durmió, en lugar de fallar la primera
consulta.

### Render

El archivo `render.yaml` en la raíz declara el servicio. Render toma `rootDir: backend`, y en
cada despliegue instala dependencias, corre `collectstatic` y aplica las migraciones. El
servicio arranca con Gunicorn.

`DJANGO_SECRET_KEY` la genera Render. Hay que cargar a mano `DATABASE_URL`,
`DJANGO_ALLOWED_HOSTS`, `DJANGO_CORS_ALLOWED_ORIGINS` y `DJANGO_CSRF_TRUSTED_ORIGINS`.

En el plan gratuito el servicio se suspende tras un período de inactividad, así que la
primera petición después de una pausa puede tardar cerca de un minuto.

### Vercel

Configurar `frontend` como directorio raíz del proyecto y definir `VITE_API_URL` apuntando a
la API en Render, incluyendo el sufijo `/api`.

El `vercel.json` reescribe todas las rutas hacia `index.html`. Sin esa regla, recargar la
página en una ruta como `/pacientes/1` devuelve 404, porque el enrutado lo resuelve React
Router en el cliente y no existe ese archivo en el servidor.

### Orden de despliegue

Las URLs se referencian entre sí, así que conviene este orden:

1. Crear la base en Neon y obtener `DATABASE_URL`.
2. Desplegar el backend en Render con esa variable. Anotar su dominio.
3. Desplegar el frontend en Vercel con `VITE_API_URL` apuntando al backend. Anotar su dominio.
4. Volver a Render y completar `DJANGO_CORS_ALLOWED_ORIGINS` con el dominio de Vercel.

### Carga inicial de datos

El plan gratuito de Render no ofrece acceso por shell, pero Neon es accesible desde
cualquier lado. La carga inicial se hace desde el entorno local apuntando a la base remota:

```bash
cd backend
source env/bin/activate
export DATABASE_URL="<cadena de conexión de Neon>"

python manage.py migrate
python manage.py loaddata api/fixtures/catalogo.json
python manage.py createsuperuser
```

Conviene abrir una terminal aparte para esto y cerrarla al terminar: mientras `DATABASE_URL`
esté exportada, cualquier comando de `manage.py` en esa sesión apunta a producción y no al
SQLite local.
