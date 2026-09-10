<<<<<<< HEAD
# OAuth Configuration Checklist

## Requisitos para Google OAuth en Producción

### 1. Variable de Entorno en Vercel (CRÍTICO)

**En el dashboard de Vercel → Proyecto → Settings → Environment Variables:**

Agregar la variable **específicamente para el entorno Production**:

```
NEXT_PUBLIC_SITE_URL=https://www.postulatucv.online
```

**Por qué es crítico:**
- Google OAuth requiere un `redirectTo` URL que apunte al dominio público real.
- El código valida el valor de `NEXT_PUBLIC_SITE_URL` y rechaza valores incorrectos:
  - URLs con hostname `.vercel.app` (deployments internos)
  - URLs sin `https://` (OAuth requiere SSL)
  - Formato inválido o valor vacío
- Si la validación falla o la variable no está configurada, el código usa el hard default `https://www.postulatucv.online` y loggea el error.
- Previamente, el código usaba `VERCEL_URL` como fallback, causando que el callback de Google fallara con `auth_callback_failed`.

### 2. Configuración en Google Cloud Console

Asegurarse de que los **Authorized redirect URIs** incluyan:

```
https://www.postulatucv.online/auth/callback
```

Y el dominio interno de Supabase:
```
https://[TU-PROYECTO-ID].supabase.co/auth/v1/callback
```

### 3. Preview Deployments

Para los Preview deployments (ramas que no sean main):
- `VERCEL_BRANCH_URL` se usa automáticamente
- No requiere configuración adicional
- Google debe tener wildcards o URLs específicas configuradas si se quiere probar OAuth en previews

### 4. Verificación Post-Deployment

Después de cada deployment a producción:

1. Hacer logout limpio en `https://www.postulatucv.online/login`
2. Click en "Continuar con Google"
3. Verificar que el redirect sea a `www.postulatucv.online/auth/callback` (NO a un hostname de Vercel interno)
4. Confirmar que el login exitoso lleve al dashboard

### 5. Troubleshooting

**Error: `auth_callback_failed` después del login con Google**

Síntomas:
- Usuario es redirigido a `/login?error=auth_callback_failed`
- UI muestra: "Error al iniciar sesión con Google. Por favor, intenta de nuevo."
- No se crea sesión

Causas posibles:
- `NEXT_PUBLIC_SITE_URL` contiene un hostname `.vercel.app` (deployment interno)
- `NEXT_PUBLIC_SITE_URL` usa `http://` en lugar de `https://`
- `NEXT_PUBLIC_SITE_URL` tiene formato inválido o está vacía después de decrypt
- Variable no configurada (usará hard default automáticamente)

Solución:
1. Verificar logs de runtime en Vercel para ver el error específico
2. Buscar en logs: `"getSiteUrl:"` para ver qué validación falló
3. Corregir el valor: `NEXT_PUBLIC_SITE_URL=https://www.postulatucv.online`
4. Re-deployar para aplicar el cambio
5. Hacer smoke test: logout → "Continuar con Google" → verificar redirect correcto

## Arquitectura del Fix

La función `getSiteUrl()` en `src/lib/actions/auth.ts` ahora:

1. **Detecta entorno de producción** vía `VERCEL_ENV === "production"` o `NODE_ENV === "production"` en Vercel

2. **En producción - Validación estricta:**
   - Lee `NEXT_PUBLIC_SITE_URL` y la valida:
     - ✅ Debe ser URL válida con formato correcto
     - ✅ Debe usar protocolo `https://` (OAuth lo requiere)
     - ✅ El hostname NO debe terminar en `.vercel.app` (son deployments internos)
   - Si pasa validación: usa ese valor
   - Si falla validación o está vacía: usa hard default `https://www.postulatucv.online` y loggea error específico
   - **NUNCA usa `VERCEL_URL`** en producción bajo ninguna circunstancia

3. **En preview/development:**
   - Sin validación estricta (permite flexibilidad para testing)
   - Prioriza: `NEXT_PUBLIC_SITE_URL` → `VERCEL_BRANCH_URL` → `VERCEL_URL` → `localhost:3000`

4. **Logging detallado:**
   - Cada fallo de validación genera un log específico con el problema detectado
   - Permite debugging rápido en Vercel runtime logs

## Historia

- **Problema detectado:** Sep 10, 2026 - producción failing con `auth_callback_failed`
- **Root cause:** `getSiteUrl()` usaba `VERCEL_URL` fallback, generando URLs de deployment interno
- **Fix aplicado:** Hard default a dominio personalizado en producción + detección de entorno explícita
=======
# Checklist de configuración OAuth - Google + Supabase

Este documento detalla la configuración necesaria para que el login con Google funcione correctamente en producción.

## ⚠️ Síntoma del problema

Cuando un usuario hace login con Google:
- Completa el flujo en Google
- Es redirigido a `https://www.postulatucv.online/?code=...`
- Permanece en la página pública sin sesión
- El parámetro `?code=` queda visible en la URL

## ✅ Solución de código (ya implementada en PR #18)

El código ahora maneja automáticamente el parámetro `?code=` en cualquier página, especialmente en `/`.

## 🔧 Configuración requerida en Supabase

### 1. Site URL

En **Dashboard de Supabase → Authentication → URL Configuration:**

```
Site URL: https://www.postulatucv.online
```

⚠️ **Importante:** Usar la URL con `www` si ese es el dominio principal.

### 2. Redirect URLs (Additional Redirect URLs)

Agregar **todas** estas URLs en **Additional Redirect URLs:**

```
https://www.postulatucv.online/auth/callback
https://www.postulatucv.online/*
https://postulatucv.online/auth/callback
https://postulatucv.online/*
https://*-soycarlosperez26s-projects.vercel.app/auth/callback
https://*-soycarlosperez26s-projects.vercel.app/*
http://localhost:3000/auth/callback
http://localhost:3000/*
```

**¿Por qué ambas versiones (www y sin www)?**
- Algunos navegadores normalizan URLs
- Los custom domains pueden redirigir entre ambas versiones
- Google puede usar cualquiera de las dos al redirigir

**¿Por qué el wildcard (`/*`)?**
- Permite que el callback funcione en `/` además de `/auth/callback`
- Es un fallback seguro para configuraciones complejas

**¿Por qué Preview URLs (`*-soycarlosperez26s-projects.vercel.app`)?**
- Permite QA de OAuth en Preview deployments antes de producción
- El wildcard `*` cubre todos los branch names y PR previews
- Sin esto, OAuth en Preview redirige siempre a producción
- **Nota:** El código usa `VERCEL_BRANCH_URL` (URL estable del branch) para que el callback funcione incluso después de nuevos deployments en el mismo branch

### 3. Verificar variables de entorno

En el proyecto de Vercel, verificar que estén configuradas:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=https://www.postulatucv.online
```

⚠️ **NEXT_PUBLIC_SITE_URL** debe coincidir exactamente con el Site URL de Supabase.

## 🔧 Configuración requerida en Google Cloud Console

### 1. Ubicar el OAuth Client

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Seleccionar el proyecto correcto
3. **APIs & Services → Credentials**
4. Buscar el **OAuth 2.0 Client ID** que usa Supabase

### 2. Authorized JavaScript origins

Agregar:
```
https://www.postulatucv.online
https://postulatucv.online
https://xxxxx.supabase.co
```

### 3. Authorized redirect URIs

⚠️ **CRÍTICO:** Verificar que existan estas URIs:

```
https://xxxxx.supabase.co/auth/v1/callback
https://www.postulatucv.online/auth/callback
https://www.postulatucv.online/
https://postulatucv.online/auth/callback
https://postulatucv.online/
https://*-soycarlosperez26s-projects.vercel.app/auth/callback
https://*-soycarlosperez26s-projects.vercel.app/
http://localhost:3000/auth/callback
```

**Explicación:**
- La primera URI (`.supabase.co/auth/v1/callback`) es la que Supabase usa internamente
- Las demás son fallbacks y para desarrollo local
- Google necesita la barra final `/` para considerar la home como redirect URI válida
- **Preview URLs** (`*-...-projects.vercel.app`) permiten QA de OAuth en Vercel Preview deployments antes de producción
- **Nota técnica:** El código usa `VERCEL_BRANCH_URL` (URL estable del branch) en lugar de `VERCEL_URL` (única por deployment)

### 4. Guardar cambios

Después de agregar las URIs, hacer clic en **Save**.

⏱️ Los cambios en Google Console pueden tardar **hasta 5 minutos** en propagarse.

## 🧪 Testing después de la configuración

### Prueba 1: Login limpio (sesión nueva)

1. Abrir navegador en modo incógnito
2. Ir a `https://www.postulatucv.online/login`
3. Click en "Continuar con Google"
4. Seleccionar cuenta de Google
5. ✅ **Esperado:** Redirige a `/dashboard` con sesión activa
6. ✅ **Esperado:** URL final es `https://www.postulatucv.online/dashboard` (sin `?code=`)

### Prueba 2: Registro con Google

1. Abrir navegador en modo incógnito
2. Ir a `https://www.postulatucv.online/register`
3. Click en "Continuar con Google"
4. Completar flujo de Google
5. ✅ **Esperado:** Redirige a `/onboarding` con sesión activa

### Prueba 3: Login con sesión existente

1. Con sesión activa, ir a `/login`
2. Click en "Continuar con Google"
3. ✅ **Esperado:** Redirige directo a `/dashboard` sin picker de Google

### Verificar logs en Vercel

Después de una prueba, revisar los logs en **Vercel → Logs → Runtime Logs**:

Buscar líneas como:
```
signInWithGoogle: requesting OAuth URL { siteUrl: '...', redirectTo: '...' }
Auth callback invoked: { hasCode: true, next: '/dashboard', configured: true }
Auth callback success, redirecting to: /dashboard
```

## ❌ Troubleshooting

### El código sigue sin ser procesado

**Síntomas:**
- Usuario aterriza en `/` con `?code=` en URL
- Se queda en página pública sin sesión

**Verificar:**
1. El PR #18 está mergeado y desplegado
2. La variable `NEXT_PUBLIC_SITE_URL` está configurada correctamente
3. El deploy se hizo **después** de cambiar variables de entorno (Next.js hornea variables `NEXT_PUBLIC_*` en build time)

### Error "auth_callback_failed" en login

**Síntomas:**
- Usuario es redirigido a `/login` con mensaje de error

**Verificar logs de Vercel para ver el error exacto:**
1. Ir a **Vercel → Logs → Runtime Logs**
2. Buscar `exchangeCodeForSession error`
3. Revisar el mensaje de error devuelto por Supabase

**Errores comunes:**
- `invalid_grant`: El código OAuth expiró (más de 60 segundos)
- `unauthorized_client`: La redirect_uri no coincide exactamente

### Google muestra "redirect_uri_mismatch"

**Causa:** La redirect_uri enviada por Supabase no está en la lista de Authorized redirect URIs de Google Console.

**Solución:**
1. Copiar exactamente la URI que aparece en el error de Google
2. Agregarla a la lista en Google Console
3. Esperar 5 minutos para propagación

## 📊 Métricas de éxito

Después de desplegar el fix y actualizar la configuración:

- ✅ 100% de logins con Google deberían completarse con sesión
- ✅ 0 usuarios deberían ver `?code=` en la URL después del login
- ✅ Logs de Vercel deberían mostrar "Auth callback success" en cada login

## 🔄 Rollback

Si algo sale mal, se puede hacer rollback del deploy en Vercel:

1. **Vercel Dashboard → Deployments**
2. Buscar el deployment anterior al PR #18
3. Click en "..." → **Promote to Production**

Esto restaura el código anterior, pero OAuth seguirá fallando hasta que se corrija la configuración.
>>>>>>> origin/main
