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
# Apertura y revisión visual

La portada ahora vive en `src/TiendaOnline/components/InvitationIntro/` y envuelve la página existente. Conserva los datos, fotografías y rutas. No incorpora dependencias.

El sobre tiene cuerpo, tarjeta, bolsillo, solapa y sello independientes. Una secuencia CSS de 2200 ms contrae ligeramente el sobre, gira la solapa con `rotateX`, eleva la tarjeta y amplía su fotografía mientras revela el Hero real. El evento `animationend` de la capa principal completa el estado `closed → opening → opened`; no hay cadenas de temporizadores. Los textos del Hero aparecen durante la misma secuencia.

El sobre aparece cerrado cada vez que se entra o se recarga la página. También se restablece al volver desde la caché de navegación del navegador. La apertura no utiliza `sessionStorage`; cualquier clave antigua `weddingInvitationOpened` se ignora.

Para repetirla, basta con recargar la página, o ejecutar en la consola:

```js
location.reload();
```

No hay controles de reinicio en producción. Con movimiento reducido, el sobre abre inmediatamente y la página no ejecuta animaciones. Si la preferencia cambia durante la apertura, también se completa de inmediato. El botón admite Enter y Espacio; el contenido permanece `inert` y el scroll bloqueado hasta terminar. Después, el foco pasa al título del Hero.

## Comandos

```sh
npm run dev -- --host 127.0.0.1
npm run lint
npm run build
node --test scripts/check-invitation.mjs
```

Las pruebas automatizadas comprueban que cada montaje comienza con el sobre cerrado, incluso con una sesión anteriormente abierta o almacenamiento bloqueado, además del botón semántico y la ocultación accesible del contenido. No sustituyen las pruebas de interacción en un navegador.

## Prueba manual en navegador

1. Revisar a 360, 375, 390, 430, 768, 1024 y 1440 px, además de móvil horizontal. Comprobar que no haya desbordamiento horizontal y que sobre, sello, textos y controles sean legibles.
2. Abrir con toque, Enter y Espacio en pruebas separadas. Comprobar la continuidad tarjeta–Hero, los clics repetidos, el bloqueo de scroll durante la apertura y su liberación al finalizar.
3. Recargar tras abrir: debe reaparecer el sobre cerrado. Repetir al entrar nuevamente y al regresar con Atrás desde otra página, incluida la restauración desde la caché de navegación.
4. Activar `prefers-reduced-motion: reduce`, repetir la apertura y comprobar que no haya transiciones. Cambiar la preferencia mientras se abre también debe liberar la página.
5. Recorrer todas las secciones, deslizar la galería y usar ambas flechas, comprobar el contador y los dos enlaces de ubicación. El RSVP flotante aparece al dejar atrás el Hero.

## Validación y pendientes

Compilación y pruebas automatizadas verificadas. ESLint conserva avisos de archivos anteriores ajenos a esta modificación; el componente nuevo no añade avisos. Browserslist informa que su base de datos está desactualizada. La inspección visual y la interacción en dispositivos quedan pendientes: no había un navegador conectado a la herramienta de revisión.

Las fotos PNG originales llegan a 22 MB: conviene crear variantes WebP/AVIF y `srcset` antes de publicar para mejorar la carga móvil. Se han conservado los archivos originales y sus rutas. El número de WhatsApp sigue como `[Número]` y el formulario existente no tiene un servicio de envío configurado; debe resolverse antes de usarlo para recibir confirmaciones reales.

---
