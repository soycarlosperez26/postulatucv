"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateCustomCv } from "@/lib/ai/generateCustomCv";

/**
 * Server action que expone la función central `generateCustomCv` a la UI.
 */
export async function generateCustomCvAction(
  _prevState: unknown,
  formData: FormData
) {
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

  try {
    await generateCustomCv({
      userId: user.id,
      baseProfileId: profileRow.id,
      jobOfferId,
    });
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : "No se pudo generar el CV.",
    };
  }

  revalidatePath(`/dashboard/offers/${jobOfferId}`);
  return { success: true };
}
