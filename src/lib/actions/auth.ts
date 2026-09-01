"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signUp(_prevState: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

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
        'Tu cuenta se creó, pero el proyecto de Supabase pide confirmar el email antes de iniciar sesión. Ve a Authentication → Providers → Email en Supabase y desactiva "Confirm email" para que el registro entre directo, o revisa tu correo para confirmar la cuenta.',
    };
  }

  redirect("/onboarding");
}

/**
 * Server action de "Continuar con Google". Se usa directamente como
 * `action` de un <form>: Supabase construye la URL de autorización de
 * Google y la devolvemos como redirect. El intercambio del código por
 * sesión ocurre en /auth/callback cuando Google redirige de vuelta.
 */
export async function signInWithGoogle() {
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
