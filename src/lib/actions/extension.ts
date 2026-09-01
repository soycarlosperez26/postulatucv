"use server";

import { randomBytes, createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface ExtensionState {
  error?: string;
  /** El token en claro. Solo se devuelve al crearlo, nunca se guarda así. */
  token?: string;
  ok?: string;
}

/**
 * Genera un token para la extensión.
 *
 * La base de datos solo recibe el hash SHA-256: si alguien leyera la
 * tabla no podría usar los tokens. El valor en claro se devuelve una vez
 * y la página se lo pasa a la extensión.
 */
export async function connectExtension(): Promise<ExtensionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesión expirada, vuelve a iniciar sesión." };
  }

  const token = `pst_${randomBytes(32).toString("base64url")}`;
  const hash = createHash("sha256").update(token).digest("hex");

  const { error } = await supabase.rpc("register_extension_token", {
    p_hash: hash,
    p_label: "Extensión de Chrome",
  });

  if (error) {
    console.error("[extension] no se pudo registrar el token:", error.message);
    return { error: "No pudimos generar el token. Inténtalo de nuevo." };
  }

  revalidatePath("/dashboard/extension");
  return { token };
}

export async function disconnectExtension(): Promise<ExtensionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesión expirada, vuelve a iniciar sesión." };
  }

  const { error } = await supabase.rpc("revoke_extension_tokens");

  if (error) {
    console.error("[extension] no se pudo revocar:", error.message);
    return { error: "No pudimos desconectar la extensión." };
  }

  revalidatePath("/dashboard/extension");
  return { ok: "La extensión quedó desconectada." };
}
