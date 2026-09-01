"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Server action del dashboard: guarda una oferta de empleo (link y/o
 * descripción pegada a mano + empresa). El parseo con IA de la
 * descripción se hace de forma perezosa, la primera vez que se genera
 * un CV custom para esta oferta (ver generateCustomCv.ts), para no
 * gastar una llamada a DeepSeek si el usuario nunca llega a usarla.
 */
export async function addJobOffer(_prevState: unknown, formData: FormData) {
  const company = String(formData.get("company") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const rawDescription = String(formData.get("rawDescription") ?? "").trim();

  if (!company || !title) {
    return { error: "Empresa y cargo son obligatorios." };
  }
  if (!rawDescription) {
    return {
      error:
        "Pega la descripción de la oferta (por ahora no la extraemos automáticamente del link).",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase.from("job_offers").insert({
    user_id: user.id,
    company,
    title,
    source_url: sourceUrl || null,
    raw_description: rawDescription,
  });

  if (error) {
    return { error: `No se pudo guardar la oferta: ${error.message}` };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
