"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

function isNextControlFlowError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const digest = 'digest' in error && typeof (error as { digest?: unknown }).digest === 'string'
    ? (error as { digest: string }).digest
    : '';
  return digest.startsWith('NEXT_REDIRECT') || digest.startsWith('NEXT_NOT_FOUND');
}

function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export async function signIn(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!isSupabaseConfigured()) {
    return { error: "El servicio de autenticación no está configurado." };
  }

  // Extraer hostname de Supabase URL para logging (sin exponer la key)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : "unknown";

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Log el error real para debugging (visible en runtime logs de Vercel)
      // Incluir hostname para verificar que se llama al proyecto correcto
      console.error("signIn error:", {
        supabaseHostname,
        code: error.code,
        error_code: (error as any).error_code, // GoTrue puede poner el código aquí
        message: error.message,
        status: error.status,
      });

      // Mapear error por código O mensaje para cubrir diferentes versiones de supabase-js
      let userFriendlyMessage: string;
      
      const errorCode = error.code || (error as any).error_code;
      const errorMessage = error.message?.toLowerCase() || "";
      
      // Credenciales inválidas: por code O por message
      if (
        errorCode === "invalid_credentials" ||
        errorMessage.includes("invalid") ||
        errorMessage.includes("credentials")
      ) {
        userFriendlyMessage = "Correo o contraseña incorrectos.";
      }
      // Email no confirmado
      else if (errorCode === "email_not_confirmed") {
        userFriendlyMessage = "Revisa tu correo y confirma el email para poder iniciar sesión.";
      }
      // Rate limit
      else if (errorCode === "over_request_rate_limit") {
        userFriendlyMessage = "Demasiados intentos. Espera un momento y vuelve a intentar.";
      }
      // Fallback genérico
      else {
        userFriendlyMessage = "Error al iniciar sesión. Por favor, intenta de nuevo.";
      }
      
      return { error: userFriendlyMessage };
    }

    if (!data.session) {
      return { error: "No se pudo crear la sesión. Por favor, intenta de nuevo." };
    }

    // Revalidar rutas para que Next.js reconozca el cambio de autenticación.
    // non-blocking: catch y log, pero NO re-lanzar a menos que sea control-flow
    try {
      revalidatePath("/", "layout");
      revalidatePath("/dashboard");
    } catch (revalidateErr) {
      // Si es control-flow de Next.js, re-lanzar
      if (isNextControlFlowError(revalidateErr)) {
        throw revalidateErr;
      }
      // Si es un error real, loggear pero no detener el login
      console.error("signIn revalidatePath warning:", {
        supabaseHostname,
        message: revalidateErr instanceof Error ? revalidateErr.message : String(revalidateErr),
      });
    }
    
    // CRITICAL: usar redirect() para que Next.js genere una respuesta HTTP 307
    // real con los headers Set-Cookie. Si devolvemos { success, redirectTo }
    // y el cliente hace router.push(), las cookies escritas por supabase.auth.signInWithPassword
    // pueden perderse en producción (especialmente con custom domains).
    redirect("/dashboard");
  } catch (err) {
    // Si redirect() lanzó control-flow de Next.js, re-lanzar
    if (isNextControlFlowError(err)) {
      throw err;
    }

    // Capturar errores de fetch/red que no generan error.code
    console.error("signIn exception:", {
      supabaseHostname,
      message: err instanceof Error ? err.message : String(err),
    });
    return { error: "Error al iniciar sesión. Por favor, intenta de nuevo." };
  }
}

export async function signUp(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!isSupabaseConfigured()) {
    return { error: "El servicio de autenticación no está configurado." };
  }

  // Extraer hostname de Supabase URL para logging (sin exponer la key)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : "unknown";

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      // Log el error real para debugging (visible en runtime logs de Vercel)
      console.error("signUp error:", {
        supabaseHostname,
        code: error.code,
        error_code: (error as any).error_code,
        message: error.message,
        status: error.status,
      });

      // Mapear error por código O mensaje
      let userFriendlyMessage: string;
      
      const errorCode = error.code || (error as any).error_code;
      
      if (errorCode === "user_already_exists") {
        userFriendlyMessage = "Ya existe una cuenta con este correo.";
      } else if (errorCode === "over_request_rate_limit") {
        userFriendlyMessage = "Demasiados intentos. Espera un momento y vuelve a intentar.";
      } else if (errorCode === "weak_password") {
        userFriendlyMessage = "La contraseña es muy débil. Usa al menos 6 caracteres.";
      } else {
        userFriendlyMessage = "Error al crear la cuenta. Por favor, intenta de nuevo.";
      }
      
      return { error: userFriendlyMessage };
    }

    // Si el proyecto de Supabase todavía tiene "Confirm email" activado,
    // signUp no crea sesión y no podemos mandar al usuario al onboarding
    // (el middleware lo rebotaría a /login por no tener sesión).
    if (!data.session) {
      return {
        error:
          "Tu cuenta se creó. Revisa tu correo y confirma el email para poder iniciar sesión.",
      };
    }

    // Revalidar rutas para que Next.js reconozca el cambio de autenticación.
    // non-blocking: catch y log, pero NO re-lanzar a menos que sea control-flow
    try {
      revalidatePath("/", "layout");
      revalidatePath("/onboarding");
    } catch (revalidateErr) {
      // Si es control-flow de Next.js, re-lanzar
      if (isNextControlFlowError(revalidateErr)) {
        throw revalidateErr;
      }
      // Si es un error real, loggear pero no detener el registro
      console.error("signUp revalidatePath warning:", {
        supabaseHostname,
        message: revalidateErr instanceof Error ? revalidateErr.message : String(revalidateErr),
      });
    }
    
    // CRITICAL: usar redirect() para que Next.js genere una respuesta HTTP 307
    // real con los headers Set-Cookie, igual que signIn.
    redirect("/onboarding");
  } catch (err) {
    // Si redirect() lanzó control-flow de Next.js, re-lanzar
    if (isNextControlFlowError(err)) {
      throw err;
    }

    // Capturar errores de fetch/red que no generan error.code
    console.error("signUp exception:", {
      supabaseHostname,
      message: err instanceof Error ? err.message : String(err),
    });
    return { error: "Error al crear la cuenta. Por favor, intenta de nuevo." };
  }
}

/**
 * Server action de "Continuar con Google". Se usa directamente como
 * `action` de un <form>: Supabase construye la URL de autorización de
 * Google y la devolvemos como redirect. El intercambio del código por
 * sesión ocurre en /auth/callback cuando Google redirige de vuelta.
 */
export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) {
    throw new Error("El servicio de autenticación no está configurado.");
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${getSiteUrl()}/auth/callback?next=/dashboard`,
    },
  });

  if (error || !data?.url) {
    throw new Error(
      error?.message ?? "No se pudo iniciar el login con Google."
    );
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
