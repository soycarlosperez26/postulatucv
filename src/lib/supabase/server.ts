import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Verifica si Supabase está configurado con las variables de entorno necesarias.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return typeof url === "string" && url.length > 0 && typeof key === "string" && key.length > 0;
}

/**
 * Cliente de Supabase para Server Components, Server Actions y
 * Route Handlers. Lee/escribe la sesión desde las cookies de la
 * request actual.
 */
export async function createClient() {
  const cookieStore = await cookies();

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase is not configured");
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createServerClient<Database>(
    url!,
    key!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error: unknown) {
            // NEXT_REDIRECT y NEXT_NOT_FOUND son errores especiales de Next.js
            // que deben propagarse siempre (son parte del flujo normal).
            if (
              error &&
              typeof error === "object" &&
              "digest" in error &&
              typeof error.digest === "string" &&
              (error.digest.startsWith("NEXT_REDIRECT") ||
                error.digest.startsWith("NEXT_NOT_FOUND"))
            ) {
              throw error;
            }

            // En Server Actions y Route Handlers, errores de cookies deben
            // propagarse (Supabase SSR requirement). Solo silenciar en
            // Server Components donde setear cookies no es posible.
            if (process.env.NODE_ENV !== "development") {
              // En producción, propagar el error (Server Actions)
              throw error;
            } else {
              // En desarrollo, loguear pero no lanzar (puede ser RSC)
              console.error("Error setting cookies:", error);
            }
          }
        },
      },
    }
  );
}
