"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromPdf } from "@/lib/pdf";
import { extractCvProfile } from "@/lib/ai/extractCvProfile";

const BUCKET = process.env.SUPABASE_CV_BUCKET ?? "cvs";

/**
 * Server action del onboarding: recibe el PDF del CV, extrae el texto,
 * lo estructura con DeepSeek y crea el `base_profile` del usuario.
 */
export async function uploadCv(_prevState: unknown, formData: FormData) {
  const file = formData.get("cv");

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecciona un archivo PDF." };
  }
  if (file.type !== "application/pdf") {
    return { error: "Por ahora solo se aceptan archivos PDF." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let rawText: string;
  try {
    rawText = await extractTextFromPdf(buffer);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "No se pudo leer el PDF.",
    };
  }

  const storagePath = `${user.id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: "application/pdf" });

  if (uploadError) {
    return { error: `No se pudo guardar el archivo: ${uploadError.message}` };
  }

  let profile;
  try {
    profile = await extractCvProfile(rawText);
  } catch (err) {
    return {
      error:
        err instanceof Error
          ? err.message
          : "No se pudo procesar el CV con IA.",
    };
  }

  const { error: dbError } = await supabase.from("base_profiles").upsert(
    {
      user_id: user.id,
      full_name: profile.contact.name || null,
      original_file_path: storagePath,
      original_file_name: file.name,
      raw_text: rawText,
      parsed: profile,
    },
    { onConflict: "user_id" }
  );

  if (dbError) {
    return { error: `No se pudo guardar el perfil: ${dbError.message}` };
  }

  redirect("/dashboard");
}
