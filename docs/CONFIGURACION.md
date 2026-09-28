# Configuración y estructura

- `src/app`: rutas y pantallas Next.js.
- `src/lib`: datos y lógica compartida.
- `public`: recursos públicos, nunca documentos privados.
- `tests`: comprobaciones del dominio.

Sin telemetría propia, anuncios ni fuentes cargadas desde servicios externos. La telemetría de Next.js puede desactivarse con `NEXT_TELEMETRY_DISABLED=1`.

## Persistencia y despliegue propio

`APP_URL` debe ser el origen exacto que visita el navegador. Usa HTTPS fuera de localhost. Las mutaciones comprueban Origin y las sesiones se envían en cookies HTTP-only, SameSite=Strict y Secure cuando APP_URL usa HTTPS. No publiques `.env.local`.

`DATA_DIR` contiene la base SQLite (`app.sqlite`, WAL y SHM). Pliegora añade `files/` con los PDF. El directorio debe ser privado, escribible y persistente, fuera de `public` y del repositorio. Las sesiones duran ocho horas. Solo se almacena el hash del token de sesión.

Esta versión admite una instancia Node con disco persistente. No la despliegues como funciones efímeras ni con réplicas independientes: perderías datos o separarías los estados. Mantén copias coherentes de SQLite con su herramienta de backup o deteniendo la aplicación; incluye los archivos asociados. Aplica permisos del sistema y una política de retención propia.

Para servir mediante un proxy local utiliza `npm start`; el proceso escucha en 127.0.0.1. El proxy proporciona HTTPS y límites de tamaño/solicitudes. No confíes en exponer directamente el puerto de desarrollo. Los límites internos son básicos por instalación/cuenta, no sustituyen protección del servidor.

## Cuentas y carta

El registro se controla con `ENABLE_SIGNUP`. En `.env.example` está cerrado expresamente: actívalo para una demo y decide después si quieres ofrecer registro público. Las contraseñas se derivan con scrypt y sal aleatoria. No hay recuperación ni verificación por correo en esta edición; no presentes esas capacidades como disponibles. Cada escritura obtiene el propietario de la sesión, nunca de un campo enviado por el cliente.

No cambies el slug si ya imprimiste QR: el SVG codifica `APP_URL/slug`. Un QR con 127.0.0.1 no es utilizable por los clientes de un restaurante desde sus teléfonos. Usa tu URL pública HTTPS cuando alojes la aplicación.

## Activar Gemini, opcional

Configura una clave propia en `GEMINI_API_KEY`, exclusivamente en servidor; nunca en una variable NEXT_PUBLIC. `GEMINI_MODEL` es configurable (el ejemplo usa gemini-3.8-flash, presente en la documentación consultada). Comprueba disponibilidad, precios y cuota en tu proyecto. Reinicia el servidor después de cambiar variables.

La ruta `/api/scan` exige sesión y origen válido. Acepta una imagen JPEG/PNG/WebP de hasta 5 MB y 25 megapíxeles, elimina metadatos al convertirla a JPEG y la reduce a 1800 px. La envía a Gemini mediante `@google/genai`, con esquema JSON y límite de espera. Los límites internos son 10 intentos por restaurante y 50 por instalación cada 24 h; no son cuotas ofrecidas por Google ni un límite de gasto garantizado.

El resultado es un borrador: el usuario revisa y corrige; un precio ilegible permanece vacío. Incorporar platos los pasa al editor, y Guardar carta persiste el conjunto. No se infieren alérgenos. Para repetir un escaneo, comprueba duplicados antes de incorporarlo.

No se ha hecho una llamada real a Gemini en esta preparación. Se han probado validación, bloqueo sin clave y el flujo de revisión con respuesta de prueba identificada como tal. Las condiciones del proveedor siguen aplicándose; no se promete uso gratuito.

Fuentes oficiales: [SDK](https://ai.google.dev/gemini-api/docs/libraries), [salida estructurada](https://ai.google.dev/gemini-api/docs/structured-output), [precios](https://ai.google.dev/gemini-api/docs/pricing), [límites](https://ai.google.dev/gemini-api/docs/rate-limits).
