# Invitación digital de boda

## Ejecutar

Con Node.js 20 o posterior y Yarn 1.22.22:

```bash
yarn install --frozen-lockfile
yarn dev
```

Para publicar en tu hosting:

```bash
yarn build
```

Sube el contenido de `dist/` al directorio público del dominio. No abras `index.html` directamente con file://. El proyecto conserva HashRouter y la ruta principal `/#/`. Si publicas dentro de una subcarpeta, configura `base` en `vite.config.ts` antes de compilar; los assets de la invitación usan BASE_URL.

## Personalización

Todo está centralizado en `src/TiendaOnline/data/invitacion.ts`:

- `novia`, `novio`, `fechaTexto`: textos visibles.
- `fechaISO`: fecha real con zona horaria, por ejemplo `2027-04-17T17:00:00-07:00`. El ejemplo no se usa por defecto. Vacía muestra guiones; al llegar a la fecha la cuenta queda en cero.
- `ceremonia`, `recepcion`: nombres, horas, direcciones y enlaces HTTPS de Google Maps. Mientras el enlace sea `[URL]`, aparece ubicación por confirmar.
- `whatsapp`: número internacional, sin `+`, espacios ni guiones. Para México: `52` y los diez dígitos. El enlace abre un mensaje editable, no envía nada automáticamente ni registra asistentes en una base de datos.
- `mensajeConfirmacion`: mensaje prellenado.
- `itinerario`: horas, títulos y descripciones.
- `dressCode`, `colores`: etiqueta y tonos orientativos.
- `fotos`: rutas relativas a public y descripciones accesibles. Reemplaza las fotos de muestra por las de la pareja; son fotografías de stock de personas distintas.
- `regalos.mostrar`: `false` para ocultar toda la sección.
- `musica.src`: deja vacío para ocultar el control o coloca un audio propio/autorizado en `public/audio/` e indica `audio/nuestra-cancion.mp3`. Se activa mediante clic, con volumen inicial de 35%, pausa y manejo de error. No se incluye una canción.
- `fraseFinal`: texto de cierre.

Actualiza también el título y la descripción de `index.html` antes de compartir. No se configuraron fechas, contactos ni ubicaciones ficticias como si fueran reales.

## Estructura conservada

- `src/main.tsx`, `router/AppRouter.tsx`, `TiendaOnlineApp.tsx` y `TiendaOnline/routes/TiendaOnlineRoutes.tsx`: conservados.
- `TiendaOnline/pages/HomePage.tsx`: composición de la invitación.
- `TiendaOnline/components`: Reveal, CuentaRegresiva, Galeria y Musica.
- `TiendaOnline/hooks/useCuentaRegresiva.ts`: actualización y limpieza del intervalo.
- `TiendaOnline/helpers/invitacion.ts`: enlaces, rutas de assets y cálculo de tiempo.
- `TiendaOnline/data/invitacion.ts`: configuración tipada por inferencia de TypeScript.
- `src/styles.css`: conserva las directivas de Tailwind; estilos añadidos bajo `.wedding`.
- `public/img/boda`: tres fotografías WebP locales (~520 KB en total).

Sin dependencias nuevas. Se fijó `packageManager` a Yarn 1.22.22 para hacer reproducible la instalación. Se conserva el lockfile original. Los archivos `*-eresto11.tsx` son referencias anteriores con imports ausentes; se mantienen intactos y se excluyen expresamente de TypeScript. No forman parte de las rutas activas. El lint general del proyecto puede reportar problemas preexistentes en esos ejemplos; la verificación de lint de esta entrega se limita a los archivos nuevos y modificados.

## Comportamiento y accesibilidad

Diseño mobile-first, galería con scroll-snap táctil y controles de teclado, imágenes lazy excepto portada, tipografía fluida, botones con foco visible, tiempos no negativos y respeto a `prefers-reduced-motion`. Las animaciones usan CSS e IntersectionObserver; no requieren Framer Motion. La navegación interna utiliza scrollIntoView para no interferir con HashRouter. El botón flotante lleva a la sección de confirmación.

## Fotografías de muestra

Fotografías descargadas de Unsplash, optimizadas a WebP y alojadas localmente:

- Hoi An and Da Nang Photographer: https://unsplash.com/it/foto/sposa-e-sposo-si-scambiano-un-tenero-bacio-il-giorno-del-matrimonio-TzHEu7lHk1g
- Browne And Dixon Photography: https://unsplash.com/photos/a-close-up-of-a-person-holding-a-bouquet-of-flowers-MXA7rxUHCHE
- Pablo Escobar: https://unsplash.com/de/fotos/braut-und-brautigam-kussen-sich-draussen-nEPJ53Nspvk

## Entrega

El ZIP contiene el código fuente y los recursos originales. No incluye `.git`, `node_modules` ni `dist`. No se publicaron cambios en el repositorio remoto ni en un hosting. Ejecuta los comandos anteriores para generar la versión de producción después de personalizar los datos.

## Verificación realizada

Compilación `yarn build` correcta (TypeScript + Vite), lint de los ocho archivos nuevos/modificados de TypeScript sin errores y comprobaciones de cuenta regresiva, enlaces y existencia de assets. No se realizó prueba visual en navegador ni envío real de WhatsApp. La música requiere que añadas tu archivo para probarla.
