import { createClient } from "@/lib/supabase/server";

/**
 * Quién puede aprobar recargas.
 *
 * ADMIN_EMAILS es una lista separada por comas. Sin la variable no hay
 * administradores: la página se comporta como si no existiera, que es
 * el estado seguro por defecto.
 */
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const list = adminEmails();
  if (list.length === 0) return false;
  return list.includes(email.toLowerCase());
}

/**
 * Comprueba contra la sesión real del servidor, no contra nada que
 * venga del cliente. Se llama tanto en la página como en cada server
 * action: la página sola no es una barrera, solo esconde botones.
 */
export async function currentUserIsAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return isAdminEmail(user?.email);
}
