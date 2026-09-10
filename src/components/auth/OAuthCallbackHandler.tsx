"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Componente que detecta si hay un código OAuth en la URL (típicamente de Google)
 * y lo intercambia por una sesión. Esto maneja el caso en que Google redirige
 * a `/` en lugar de `/auth/callback` debido a configuración de redirect_uri.
 */
export function OAuthCallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processingRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");
    const next = searchParams.get("next") || "/dashboard";

    // Si no hay código o ya estamos procesando, no hacer nada
    if (!code || processingRef.current) {
      return;
    }

    // Marcar que estamos procesando para evitar ejecuciones duplicadas
    processingRef.current = true;

    const exchangeCode = async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          console.error("Error exchanging OAuth code:", error);
          // Redirigir a login con un mensaje de error
          router.push("/login?error=auth_callback_failed");
          return;
        }

        // Éxito: redirigir a la página destino
        router.push(next);
      } catch (err) {
        console.error("Exception during OAuth code exchange:", err);
        router.push("/login?error=auth_callback_failed");
      }
    };

    exchangeCode();
  }, [searchParams, router]);

  // Este componente no renderiza nada visible
  return null;
}
