# VIAJAYA-AGENCIA-DE-VIAJES

**Universidad de las Fuerzas Armadas ESPE**
Asignatura: Fundamentos Web
Estudiante: Dayana Chavarria
Paralelo: 29535

## Descripción

ViajaYa es una tienda en línea de paquetes de viaje que evolucionó, a lo largo de los
tres parciales de la asignatura, desde una página estática con HTML semántico hasta
una aplicación web dinámica e interactiva construida con JavaScript, archivos JSON,
`localStorage`, librerías externas y consumo de APIs.

## Objetivo

Integrar HTML semántico, diseño responsivo, JavaScript, archivos JSON, almacenamiento
local, librerías (SweetAlert2, Toastify, Chart.js) y APIs externas (países y clima) en
un único sistema coherente y funcional.

## Funcionalidades principales

- Carga dinámica de paquetes turísticos, categorías y usuarios desde archivos JSON.
- Persistencia en `localStorage` tras la primera carga (fetch → localStorage → uso posterior).
- Búsqueda en tiempo real (evento `input`) por nombre, destino, ciudad o descripción.
- Filtros combinables por categoría, disponibilidad y precio máximo.
- Ordenamiento por precio, nombre y valoración.
- Registro, edición y eliminación de paquetes, con validación de formularios.
- Confirmaciones y notificaciones con SweetAlert2 y Toastify.
- Panel de indicadores (total de paquetes, categorías, disponibles, precio promedio, resultados filtrados).
- Gráfico de Chart.js: paquetes por categoría, actualizado tras cada operación CRUD.
- Restablecimiento de los datos originales desde los archivos JSON.
- Formulario de registro de usuario con selector de nacionalidad conectado a la API
  de países (`https://countries.dev/countries`), con búsqueda y bandera.
- Página de clima (`clima.html`) que consulta Open-Meteo para cuatro ciudades de salida.
- Manejo de errores con `try/catch` y verificación de `response.ok` en todas las
  llamadas a `fetch`.

## Tecnologías utilizadas

HTML5 semántico, CSS3 (variables, Flexbox, Grid, media queries), JavaScript (ES6+),
JSON, `localStorage`, Fetch API.

## Librerías incorporadas

| Librería | Uso en el proyecto |
|---|---|
| SweetAlert2 | Confirmaciones de eliminación y restablecimiento, detalle de paquetes, mensajes de éxito |
| Toastify | Notificaciones breves de registro, edición y eliminación |
| Chart.js | Gráfico de paquetes por categoría |
| Font Awesome | Iconografía de categorías y navegación |

## APIs consumidas

| API | Uso |
|---|---|
| `https://countries.dev/countries` | Selector de nacionalidad en el registro de usuario |
| Open-Meteo (`api.open-meteo.com`) | Clima actual en las ciudades de salida |

## Estructura de carpetas

```
└── 📁 proyecto-viajes
    ├── 📁 css
    │   ├── 🎨 componentes.css
    │   ├── 🎨 general.css
    │   └── 🎨 responsive.css
    ├── 📁 img
    │   └── 🖼️ Favicon.jpg
    ├── 📁 js
    │   ├── 📄 api.js
    │   ├── 📄 componentes.js
    │   ├── 📄 datos.js
    │   ├── 📄 main.js
    │   ├── 📄 storage.js
    │   └── 📄 validaciones.js
    ├── 📁 json
    │   ├── ⚙️ categorias.json
    │   ├── ⚙️ destinos.json
    │   └── ⚙️ usuarios.json
    ├── 📁 pages
    │   ├── 🌐 catalogo.html
    │   ├── 🌐 clima.html
    │   ├── 🌐 contacto.html
    │   └── 🌐 registro.html
    └── 🌐 index.html
```

> Nota de diseño: la vista de detalle (sección 7.5 del enunciado) se implementó
> mediante un modal de SweetAlert2 con contenido HTML, en lugar de una página
> `detalle.html` independiente, ya que esa es una de las opciones válidas
> planteadas por el enunciado. La sección de clima cumple el rol de la API
> contextual adicional (alternativa A del enunciado).

## Instrucciones de ejecución

1. Clonar o descargar el repositorio.
2. Abrir la carpeta con Visual Studio Code.
3. Ejecutar `index.html` mediante la extensión **Live Server** (o cualquier
   servidor local equivalente), ya que los archivos JSON se cargan con `fetch`
   y no funcionan abriendo el HTML directamente desde el sistema de archivos.
4. Navegar por el menú superior: Inicio, Catálogo, Registro, Clima de salida y Contacto.
