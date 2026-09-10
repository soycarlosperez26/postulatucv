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
- Si `NEXT_PUBLIC_SITE_URL` no está configurada, el código caerá en el hard default `https://www.postulatucv.online`.
- Sin esta variable, previamente el código usaba `VERCEL_URL`, que genera hostnames de deployment internos (ej: `postulatucv-dlhpca76s-projects.vercel.app`), causando que el callback de Google falle con `auth_callback_failed`.

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

Causa:
- `redirectTo` URL usaba hostname de deployment en lugar del dominio personalizado
- Supabase no pudo completar el intercambio de código por sesión

Solución:
- Verificar que `NEXT_PUBLIC_SITE_URL=https://www.postulatucv.online` esté configurada en Production
- Re-deployar si fue agregada recientemente
- Verificar logs de runtime en Vercel para ver qué URL se construyó

## Arquitectura del Fix

La función `getSiteUrl()` en `src/lib/actions/auth.ts` ahora:

1. **Detecta entorno de producción** vía `VERCEL_ENV === "production"` o `NODE_ENV === "production"` en Vercel
2. **En producción:**
   - Usa `NEXT_PUBLIC_SITE_URL` si está configurada
   - Si no está configurada, usa hard default `https://www.postulatucv.online` y loggea un warning
   - **NUNCA usa `VERCEL_URL`** en producción
3. **En preview/development:**
   - Prioriza: `NEXT_PUBLIC_SITE_URL` → `VERCEL_BRANCH_URL` → `VERCEL_URL` → `localhost:3000`
   - Permite flexibilidad para testing

## Historia

- **Problema detectado:** Sep 10, 2026 - producción failing con `auth_callback_failed`
- **Root cause:** `getSiteUrl()` usaba `VERCEL_URL` fallback, generando URLs de deployment interno
- **Fix aplicado:** Hard default a dominio personalizado en producción + detección de entorno explícita
