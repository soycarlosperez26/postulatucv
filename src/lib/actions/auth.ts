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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const userFriendlyMessage = 
      error.message.toLowerCase().includes("invalid") || 
      error.message.toLowerCase().includes("credentials")
        ? "Correo o contraseña incorrectos."
        : "Error al iniciar sesión. Por favor, intenta de nuevo.";
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
}

export async function signUp(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!isSupabaseConfigured()) {
    return { error: "El servicio de autenticación no está configurado." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
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
