import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Cliente con service role: se salta RLS por completo.
 *
 * IMPORTANTE: solo puede importarse desde el webhook de Wompi
 * (src/app/api/wompi/webhook/route.ts). Nunca desde un componente, una
 * página ni una server action alcanzable por el usuario — con esta llave
 * se puede leer y escribir cualquier fila de cualquier usuario.
 *
 * La única función que necesita este cliente es `grant_purchased_credits`,
 * que está revocada para `authenticated` justamente porque acredita saldo.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY para procesar el pago."
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
