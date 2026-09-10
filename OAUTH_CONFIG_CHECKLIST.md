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
