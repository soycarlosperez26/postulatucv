# Extensión de Chrome de Postula

Guarda ofertas laborales en tu cuenta desde el portal donde las encuentras.

## Instalar en modo desarrollador

1. Abre `chrome://extensions` y activa **Modo de desarrollador**.
2. **Cargar descomprimida** → elige esta carpeta (`extension/`).
3. Entra a `/dashboard/extension` en Postula y presiona **Conectar extensión**.

El token viaja de la página a la extensión por `window.postMessage`, que
recoge `src/connect.js`. La web nunca necesita saber el id de la
extensión — que en modo desarrollador cambia en cada instalación.

## Antes de publicar

- **Revisa los dominios del manifiesto.** `host_permissions` y los
  `matches` de `connect.js` traen `localhost:3000` y `postula.co`. Ajusta
  al dominio real antes de empaquetar y quita localhost.
- La Chrome Web Store pide política de privacidad publicada y una
  justificación por permiso.

## Permisos y por qué

| Permiso | Para qué |
|---|---|
| `storage` | Guardar el token y el origen en `chrome.storage.local`. |
| `activeTab` + `scripting` | Leer la página **solo** cuando das clic en el ícono. |
| `host_permissions` de postula.co | Que el service worker pueda llamar a nuestra API sin CORS. |
| `content_scripts` en 2 portales | Encender el ícono al detectar una oferta. |

No se pide `<all_urls>`: en portales desconocidos el extractor se inyecta
bajo demanda, no queda corriendo.

## Cómo extrae

Por capas, en `src/extractors/`:

1. `jsonld.js` — `JobPosting` de schema.org para título, empresa y ciudad.
   **La descripción no sale de aquí**: en elempleo viene truncada al primer
   párrafo (762 caracteres contra 5.526 visibles), lo que dejaría el score
   ATS corto de palabras clave.
2. `computrabajo.js` / `elempleo.js` — adaptadores del portal.
3. `generico.js` — cualquier otro sitio: ancla por rótulo y, si falla, el
   bloque de texto más denso.

Los adaptadores se anclan en **texto** (`Descripción de la oferta`) y no en
clases CSS: las de Computrabajo son utilitarias (`div.mb40.pb40.bb1`) y se
rompen con cualquier retoque de diseño.

En Computrabajo hay que excluir "Ofertas similares" a propósito: el
`<main>` incluye ocho vacantes ajenas que contaminarían la descripción.

Si un extractor falla, el campo llega vacío a la ventana y el usuario lo
corrige. Nunca se guarda sin que lo vea.

## Iconos

`icons/icon-{16,48,128}.png` — cuadrado ámbar con la P verde, la misma
geometría del logo de la web (`src/components/ui/Logo.tsx`).

Los genera `scripts/generar-iconos.mjs`, que rasteriza la forma con
supermuestreo y escribe el PNG con `zlib`, sin dependencias. El mismo
script produce los iconos del sitio (`src/app/icon.png`, `favicon.ico` y
`apple-icon.png`), así que marca y pestaña nunca se desincronizan.

Si cambia la marca, edita los colores o el trazo ahí y corre desde la
raíz del repo:

```
node scripts/generar-iconos.mjs .
```
