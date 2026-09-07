"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromPdf } from "@/lib/pdf";
import { extractCvProfile } from "@/lib/ai/extractCvProfile";
import { sanitizeFilename, validateCvFile } from "@/lib/fileUtils";

// Usar || en lugar de ?? para manejar strings vacíos además de null/undefined
const BUCKET = process.env.SUPABASE_CV_BUCKET?.trim() || "cvs";

/**
 * Server action del onboarding: recibe el PDF del CV, extrae el texto,
 * lo estructura con DeepSeek y crea el `base_profile` del usuario.
 */
export async function uploadCv(_prevState: unknown, formData: FormData) {
  const file = formData.get("cv");

  if (!(file instanceof File)) {
    console.error("[uploadCv] No file in FormData or file is not a File instance", {
      hasFile: !!file,
      fileType: typeof file,
      fileConstructor: file?.constructor?.name,
      formDataKeys: Array.from(formData.keys()),
    });
    return { error: "Selecciona un archivo PDF." };
  }

  const validation = validateCvFile(file);
  if (!validation.valid) {
    console.error("[uploadCv] File validation failed", {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      error: validation.error,
    });
    return { error: validation.error };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("[uploadCv] No authenticated user");
    redirect("/login");
  }

  console.log("[uploadCv] Processing file upload", {
    userId: user.id,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
  });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let rawText: string;
  try {
    rawText = await extractTextFromPdf(buffer);
  } catch (err) {
    console.error("[uploadCv] PDF text extraction failed", {
      fileName: file.name,
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      error: err instanceof Error ? err.message : "No se pudo leer el PDF.",
    };
  }

  const sanitizedFilename = sanitizeFilename(file.name);
  const storagePath = `${user.id}/${Date.now()}-${sanitizedFilename}`;
  
  console.log("[uploadCv] Uploading to Supabase Storage", {
    bucket: BUCKET,
    storagePath,
    originalFileName: file.name,
    sanitizedFileName: sanitizedFilename,
    bufferSize: buffer.length,
  });

  // Supabase Storage acepta Uint8Array, Blob, o File
  // Convertir Buffer a Uint8Array para compatibilidad
  const fileData = new Uint8Array(buffer);
  
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileData, { contentType: "application/pdf" });

  if (uploadError) {
    console.error("[uploadCv] Supabase Storage upload failed", {
      bucket: BUCKET,
      storagePath,
      errorMessage: uploadError.message,
      errorName: uploadError.name,
      errorDetails: uploadError,
    });
    
    // Dar mensaje más específico según el tipo de error
    if (uploadError.message?.includes("Bucket not found") || 
        uploadError.message?.includes("bucket")) {
      return { error: "Error de configuración del almacenamiento. Contacta soporte." };
    }
    
    if (uploadError.message?.includes("policy") || 
        uploadError.message?.includes("permission") ||
        uploadError.message?.includes("RLS")) {
      return { error: "No tienes permisos para subir archivos. Intenta cerrar sesión y volver a entrar." };
    }
    
    // Error genérico pero con más contexto en logs
    return { error: `No se pudo guardar el archivo: ${uploadError.message}` };
  }

  console.log("[uploadCv] File uploaded successfully to Storage", { storagePath });

  let profile;
  try {
    profile = await extractCvProfile(rawText);
  } catch (err) {
    console.error("[uploadCv] AI profile extraction failed", {
      error: err instanceof Error ? err.message : String(err),
      textLength: rawText.length,
    });
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
    console.error("[uploadCv] Database upsert failed", {
      error: dbError.message,
      code: dbError.code,
    });
    return { error: `No se pudo guardar el perfil: ${dbError.message}` };
  }

  console.log("[uploadCv] Profile saved successfully, redirecting to dashboard");
  redirect("/dashboard");
}
