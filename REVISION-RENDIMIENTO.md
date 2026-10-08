# Revisión de rendimiento

Se conservan las secciones, los estilos, las fotos, los encuadres y las animaciones.
No se modifican los tiempos de la entrada cinematográfica ni del itinerario.

## Cambios

- Versiones WebP de nueve imágenes pesadas, con calidad 95/100 y varios tamaños.
  El navegador elige la resolución según el espacio y la densidad de la pantalla.
  Los originales permanecen intactos.
- La sexta foto del carrusel, de unos 100 KB, se sirve directamente sin volver
  a comprimirla. Las imágenes que ya eran ligeras no se modifican.
- La selección de resolución considera el recorte de las fotos horizontales
  dentro de los marcos verticales del carrusel. El fondo del cierre conserva
  también una versión de 3600 px para pantallas grandes o de alta densidad.
- Decodificación asíncrona de las imágenes. Se mantienen la carga diferida de
  las fotos secundarias y la prioridad alta de la portada.
- Carga del panel y de la confirmación personalizada al visitar sus rutas.
  El código del lector QR y de los pases ya no se descarga en la página pública.
- El lector QR reutiliza el tamaño de su canvas mientras la cámara no cambie
  de resolución, evitando reiniciar su superficie en cada lectura.

## Medición en producción

Se utilizó `vite preview`, caché desactivada, red simulada de 10 Mbps y 80 ms de
latencia. El perfil móvil usa un viewport de 390 × 844 y una CPU ralentizada 4×;
el perfil de escritorio usa 1280 × 720. Las animaciones estuvieron activas.
Las mediciones finales se ejecutaron sin la suite de pruebas en paralelo.

| Medición | Antes | Después |
| --- | --- | --- |
| JavaScript inicial, sin comprimir | 399.39 KB | 216.08 KB |
| Portada descargada y decodificada, escritorio | 17.12 s | 1.49 s |
| Portada descargada y decodificada, perfil móvil | 17.20 s | 1.12 s |
| Intervalos de más de 50 ms durante el recorrido móvil | 2 | 0 |
| Intervalos de más de 50 ms durante la apertura móvil | 0 | 0 |

El percentil 95 de los intervalos de `requestAnimationFrame` en la medición final
fue de aproximadamente 16.7–16.8 ms durante la apertura y el desplazamiento.
El recorrido de escritorio registró un intervalo aislado de unos 67 ms, frente
a tres intervalos superiores a 50 ms antes de optimizar. El CLS final fue cero
en ambos perfiles.

El tiempo de portada mide hasta que termina `HTMLImageElement.decode()`;
no es el tiempo de descarga de toda la página. Son mediciones locales de
Chromium, con densidad de pantalla 1×, no una garantía de FPS ni de tiempos para
todos los dispositivos y conexiones. Las pruebas funcionales móviles también
ejercitan la selección de imágenes con la densidad de la emulación de iPhone.

## Calidad y validación

Se compararon capturas con los originales y con las versiones optimizadas de la
portada, bienvenida, galería, lugares y cierre a 390 y 1280 px. Las dimensiones
de todas las secciones permanecen idénticas. Se inspeccionaron las capturas para
verificar encuadre, detalle y colores. WebP de calidad 95 usa compresión con
pérdida; los originales quedan disponibles para conservar la calidad íntegra.

- Compilación de producción correcta.
- Lint sin errores; siguen las tres advertencias anteriores de tipos de retorno.
- Cuatro pruebas unitarias aprobadas.
- Noventa pruebas generales aprobadas en Chromium, emulación móvil, Firefox y
  WebKit; cuatro pruebas adicionales de carga y animaciones reales aprobadas
  en escritorio y móvil tras los ajustes finales de calidad.
- Las pruebas específicas verifican que se usan los recursos ligeros, que no
  se carga código privado en la portada y que la animación original termina y
  libera el desplazamiento.

## Repetir las comprobaciones

```powershell
yarn build
yarn preview --host 127.0.0.1 --port 5181 --strictPort
```

En otra terminal, desde `FRONT`:

```powershell
node scripts/audit-performance.mjs
yarn test:e2e tests/performance.spec.ts --project=desktop --project=mobile
```

Los resultados de medición se guardan en `performance-results/`, excluido de Git.
Para regenerar las versiones de las fotos, con Python y Pillow disponibles:

```powershell
python scripts/optimize-images.py
yarn build
```
