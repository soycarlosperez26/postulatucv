"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

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

    // Revalidar primero el layout root para que Next.js reconozca el cambio de autenticación
    revalidatePath("/", "layout");
    // Luego revalidar específicamente /dashboard para asegurar que se actualice
    revalidatePath("/dashboard");
    
    // Retornar success para que el cliente maneje el redirect
    // Esto evita que el middleware intercepte el redirect del server action
    return { success: true, redirectTo: "/dashboard" };
  } catch (err) {
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

    // Revalidar primero el layout root para que Next.js reconozca el cambio de autenticación
    revalidatePath("/", "layout");
    // Luego revalidar específicamente /onboarding para asegurar que se actualice
    revalidatePath("/onboarding");
    
    // Retornar success para que el cliente maneje el redirect
    // Esto evita que el middleware intercepte el redirect del server action
    return { success: true, redirectTo: "/onboarding" };
  } catch (err) {
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
