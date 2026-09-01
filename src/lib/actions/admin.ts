"use server";

import { revalidatePath } from "next/cache";
import { currentUserIsAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export interface AdminActionState {
  error?: string;
  ok?: string;
}

/**
 * Cada acción vuelve a comprobar quién es el usuario contra la sesión
 * del servidor. Esconder el botón en la página no es una barrera: las
 * server actions son endpoints y cualquiera puede invocarlas.
 */
async function assertAdmin(): Promise<string | null> {
  const admin = await currentUserIsAdmin();
  return admin ? null : "No tienes permiso para gestionar recargas.";
}

function normalizeReference(formData: FormData): string {
  return String(formData.get("reference") ?? "")
    .trim()
    .toUpperCase();
}

/** Acredita los créditos de una solicitud ya pagada. */
export async function approveOrder(
  _prevState: unknown,
  formData: FormData
): Promise<AdminActionState> {
  const denied = await assertAdmin();
  if (denied) return { error: denied };

  const reference = normalizeReference(formData);
  if (!reference) return { error: "Falta el código de la solicitud." };

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("approve_manual_order", {
    p_reference: reference,
  });

  if (error) {
    console.error("[admin] no se pudo aprobar:", error.message);
    return { error: `No se pudo aprobar ${reference}: ${error.message}` };
  }

  revalidatePath("/dashboard/admin/creditos");

  return {
    ok:
      data === true
        ? `Créditos acreditados para ${reference}.`
        : `${reference} ya estaba acreditada; no se duplicó nada.`,
  };
}

/** Descarta una solicitud que nunca se pagó. No toca el saldo. */
export async function rejectOrder(
  _prevState: unknown,
  formData: FormData
): Promise<AdminActionState> {
  const denied = await assertAdmin();
  if (denied) return { error: denied };

  const reference = normalizeReference(formData);
  if (!reference) return { error: "Falta el código de la solicitud." };

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("reject_manual_order", {
    p_reference: reference,
  });

  if (error) {
    console.error("[admin] no se pudo descartar:", error.message);
    return { error: `No se pudo descartar ${reference}: ${error.message}` };
  }

  revalidatePath("/dashboard/admin/creditos");
  return { ok: `Solicitud ${reference} descartada.` };
}
