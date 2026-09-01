# MiCurriculum

MVP: el usuario sube su CV una vez, agrega ofertas de empleo, y genera una
versión del CV adaptada a cada oferta con un puntaje de coincidencia ATS.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind v4
- Supabase (Auth + Postgres + Storage)
- DeepSeek (extracción de datos y generación del CV adaptado, vía function calling compatible con la API de OpenAI)

## Cómo funciona el matching ATS

El score **no** se le pide a la IA como una opinión libre. Se calcula de
forma determinística en `src/lib/ai/computeAtsScore.ts`, cruzando las
keywords/skills que DeepSeek extrajo de la oferta contra las skills y
experiencia del perfil del candidato. Esto imita cómo filtran los ATS
reales (Workday, Greenhouse, Taleo...) y permite mostrarle al usuario
exactamente qué palabra clave le falta.

La función central del producto es `generateCustomCv` en
`src/lib/ai/generateCustomCv.ts`: orquesta extracción de requisitos →
cálculo de score → generación del CV adaptado → guardado en Supabase.
Está aislada de la capa de Server Actions para poder reutilizarla desde
otras herramientas más adelante (carta de presentación, prep de
entrevistas, etc.).

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Crear el proyecto en Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Ve a **SQL Editor** y ejecuta el contenido de `supabase/schema.sql`.
   Esto crea las tablas (`base_profiles`, `job_offers`, `tailored_cvs`),
   las políticas de Row Level Security, y el bucket privado `cvs` en
   Storage.
3. **Desactiva la confirmación de email** (requerido para que el
   registro deje al usuario adentro de una vez, sin esperar un correo):
   ve a **Authentication → Sign In / Providers → Email** y apaga
   "Confirm email". Si lo dejas activo, `signUp` no crea sesión y la
   UI se lo avisa al usuario en vez de fallar en silencio.
4. **Habilita login con Google**:
   1. En [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
      crea un "OAuth client ID" de tipo **Web application**.
   2. En Supabase, ve a **Authentication → Providers → Google**, actívalo
      y copia el **Callback URL (for OAuth)** que te muestra ahí mismo
      (algo como `https://<tu-proyecto>.supabase.co/auth/v1/callback`).
   3. Pega esa URL como "Authorized redirect URI" en el OAuth client de
      Google, y copia el **Client ID** y **Client Secret** de Google de
      vuelta al provider de Google en Supabase. Guarda.

### 3. Variables de entorno

Copia `.env.example` a `.env.local` y completa:

```bash
cp .env.example .env.local
```

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`: en
  Supabase → Project Settings → API.
- `DEEPSEEK_API_KEY`: en [platform.deepseek.com](https://platform.deepseek.com).
- `NEXT_PUBLIC_SITE_URL`: `http://localhost:3000` en local; tu dominio real
  una vez desplegado (lo usa el login con Google para volver a tu app).

### 4. Correr en local

```bash
npm run dev
```

Abre http://localhost:3000. Regístrate, sube un CV en PDF, agrega una
oferta y genera el CV custom.

## Flujo del producto (v1)

1. **Registro/login** (Supabase Auth).
2. **Onboarding**: sube un CV en PDF → se extrae el texto y se
   estructura con DeepSeek en `base_profiles`.
3. **Dashboard**: lista de ofertas guardadas + botón para agregar una
   nueva (empresa, cargo, descripción pegada a mano; el link es solo
   referencia, no se scrapea automáticamente en esta versión).
4. **Detalle de oferta**: botón "Generar CV a medida" → corre
   `generateCustomCv`, muestra el CV adaptado, el % de match ATS y las
   keywords que faltan.

## Próximos pasos (fuera de este MVP)

- Generación de preguntas/simulacro de entrevista a partir de los gaps
  detectados.
- Export del CV adaptado a PDF/DOCX.
- Scraping del link de la oferta en vez de pegar la descripción a mano.
- Historial de versiones del CV custom por oferta.

## Nota sobre `middleware.ts`

Next.js 16 renombró la convención `middleware.ts` a `proxy.ts` (mismo
comportamiento, nuevo nombre). Este proyecto todavía usa `middleware.ts`
porque sigue funcionando (solo aparece un warning en el build). Si quieres
migrar al nuevo nombre, corre:

```bash
npx @next/codemod@canary middleware-to-proxy .
```

## Notas de este entorno de desarrollo

Este proyecto se generó archivo por archivo (sin `node_modules`) porque
el sandbox donde se creó no podía ejecutar `npm install` de forma
confiable. Corre `npm install && npm run build` localmente antes de tu
primer despliegue para confirmar que todo compila; si algo falla,
probablemente sea una versión de dependencia a ajustar en
`package.json`, no un problema de lógica.
