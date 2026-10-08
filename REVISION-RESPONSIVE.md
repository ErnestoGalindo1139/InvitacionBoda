# Revisión responsive de FRONT

Se conservan la estructura de componentes, las rutas, las secciones, las imágenes,
los colores y la identidad visual. Los cambios afectan la adaptación del espacio
disponible y el desplazamiento del contenido.

## Hallazgos y correcciones

| Área | Problema | Corrección |
| --- | --- | --- |
| Portada | En 844 × 390 y 1024 × 600, la fecha y los créditos invadían el texto principal. | En pantallas de hasta 700 px de altura, esos bloques ocupan espacio dentro del flujo de la portada. |
| Portada de escritorio | Los créditos invadían el botón «Descubre la historia». | Se reserva más espacio entre ambos bloques. |
| Detalle de invitados | Un nombre de 150 caracteres podía cubrir los botones con el encabezado fijo en una pantalla de 320 × 320. | El encabezado se desplaza junto al contenido en móviles y pantallas bajas. |
| Controles del panel | Los campos y selectores móviles heredaban un tamaño de letra menor de 16 px. | Se establece 1 rem en pantallas de hasta 600 px para evitar el zoom automático al enfocar campos en Safari móvil. |
| Componentes antiguos de simposio | Formularios demasiado estrechos, imágenes con alturas inadecuadas y modales sin reservar espacio para su encabezado. | Se ajustan límites de tamaño, columnas por breakpoint y desplazamiento interno. |

## Cobertura

Las rutas activas son `/`, `/invitacion/:token`, `/admin` y la página de enlace
desconocido. Se revisaron los estilos compartidos y los componentes de entrada,
portada, galería, itinerario, confirmación, pase, directorio, diálogos y lector QR.

La suite `tests/responsive.spec.ts` recorre 14 tamaños:

- 320 × 568, 360 × 640 y 390 × 844.
- 600 × 800, 601 × 800, 768 × 1024, 820 × 1180 y 821 × 1180.
- 1024 × 768, 1280 × 720 y 1920 × 1080.
- 568 × 320, 844 × 390 y 1024 × 600 en horizontal.

Además comprueba un diálogo con nombre de 150 caracteres en 320 × 320. Valida
límites de ancho, controles sin texto recortado, ausencia de superposiciones en la
portada, desplazamiento de la galería y acceso a las acciones del diálogo.

Las pruebas usan respuestas de API simuladas; no modifican invitados reales.
Se ejecutaron en Chromium, emulación móvil de Chromium, Firefox y WebKit. WebKit
se ejecutó en Windows; no equivale a una prueba física en iPhone.

Los archivos `*-eresto11.tsx` están excluidos de TypeScript y ESLint y no forman
parte de las rutas actuales. Se revisaron estáticamente y se comprobó la sintaxis
de los cuatro archivos antiguos modificados. Algunas páginas antiguas importan
componentes o recursos que no existen en este proyecto, por lo que no se certifica
su funcionamiento completo en navegador.

## Resultados

- `yarn build`: correcto.
- `yarn test`: 4 pruebas aprobadas.
- `yarn lint`: sin errores; 3 advertencias preexistentes de tipos de retorno.
- `yarn test:e2e --workers=4`: 88 pruebas aprobadas.
- `git diff --check`: correcto.

Para repetir la validación en otra máquina, instalar los motores de Playwright
con `yarn playwright install chromium firefox webkit` y ejecutar los comandos
anteriores.
