"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { generateCustomCv } from "@/lib/ai/generateCustomCv";
import { consumeCredit, refundCredit } from "@/lib/credits";

export interface GenerateCvState {
  error?: string;
  /** true cuando el error es falta de saldo: la UI ofrece comprar. */
  needsCredits?: boolean;
  success?: boolean;
}

/**
 * Server action que expone la función central `generateCustomCv` a la UI.
 *
 * El cobro vive aquí y no dentro de `generateCustomCv` a propósito: esa
 * función está aislada de la capa de acciones para poder reutilizarla
 * (carta de presentación, prep de entrevista, un cron), y meterle
 * facturación la ataría a este flujo.
 *
 * Se cobra ANTES de generar. Es lo que cierra la puerta al doble envío:
 * dos clics simultáneos compiten por el mismo bloqueo de fila en
 * Postgres y solo uno consigue el crédito. Si se generara primero,
 * ambos llamarían a DeepSeek antes de que ninguno cobrara.
 */
export async function generateCustomCvAction(
  _prevState: unknown,
  formData: FormData
): Promise<GenerateCvState> {
  const jobOfferId = String(formData.get("jobOfferId") ?? "");
  if (!jobOfferId) {
    return { error: "Falta la oferta de empleo." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sesión expirada, vuelve a iniciar sesión." };
  }

  const { data: profileRow } = await supabase
    .from("base_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profileRow) {
    return { error: "Primero sube tu CV base desde el onboarding." };
  }

  const reference = `${jobOfferId}:${randomUUID()}`;
  const charge = await consumeCredit(reference);

  if (!charge.ok) {
    if (charge.reason === "sin_creditos") {
      return {
        error:
          "Te quedaste sin créditos. Compra un paquete para seguir generando CV a medida.",
        needsCredits: true,
      };
    }
    return { error: charge.message };
  }

  try {
    await generateCustomCv({
      userId: user.id,
      baseProfileId: profileRow.id,
      jobOfferId,
    });
  } catch (err) {
    // La generación falló: el crédito no se cobra.
    await refundCredit(reference);
    return {
      error: err instanceof Error ? err.message : "No se pudo generar el CV.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/offers/${jobOfferId}`);
  revalidatePath(`/dashboard/offers/${jobOfferId}/cv`);
  return { success: true };
}
