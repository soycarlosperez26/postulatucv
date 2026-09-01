import { createClient } from "@/lib/supabase/server";
import { extractJobRequirements } from "./extractJobRequirements";
import { computeAtsScore } from "./computeAtsScore";
import { tailorCv } from "./tailorCv";
import type {
  CvProfile,
  JobRequirements,
  GenerateCustomCvResult,
} from "@/types/domain";

/**
 * Función central del producto.
 *
 * Dado un perfil base y una oferta ya guardados en Supabase:
 *   1. Extrae los requisitos de la oferta con DeepSeek (si no se hizo antes).
 *   2. Calcula el match ATS de forma determinística (keyword matching).
 *   3. Genera el CV adaptado a la oferta con DeepSeek, sin inventar hechos.
 *   4. Persiste el resultado en `tailored_cvs`.
 *
 * Vive aislada de la capa de Server Actions / rutas para poder
 * reutilizarla después desde otra herramienta (carta de presentación,
 * prep de entrevistas, un cron, una cola) sin duplicar lógica.
 */
export async function generateCustomCv(params: {
  userId: string;
  baseProfileId: string;
  jobOfferId: string;
}): Promise<GenerateCustomCvResult> {
  const supabase = await createClient();

  const [profileResult, offerResult] = await Promise.all([
    supabase
      .from("base_profiles")
      .select("*")
      .eq("id", params.baseProfileId)
      .eq("user_id", params.userId)
      .single(),
    supabase
      .from("job_offers")
      .select("*")
      .eq("id", params.jobOfferId)
      .eq("user_id", params.userId)
      .single(),
  ]);

  if (profileResult.error || !profileResult.data) {
    throw new Error("No se encontró el perfil base del usuario.");
  }
  if (offerResult.error || !offerResult.data) {
    throw new Error("No se encontró la oferta de empleo.");
  }

  const profileRow = profileResult.data;
  const offerRow = offerResult.data;
  const profile: CvProfile = profileRow.parsed;

  let requirements: JobRequirements;
  const alreadyParsed =
    offerRow.parsed &&
    typeof offerRow.parsed === "object" &&
    "keywords" in offerRow.parsed;

  if (alreadyParsed) {
    requirements = offerRow.parsed as JobRequirements;
  } else {
    requirements = await extractJobRequirements(offerRow.raw_description);
    await supabase
      .from("job_offers")
      .update({ parsed: requirements })
      .eq("id", offerRow.id);
  }

  const atsScore = computeAtsScore(profile, requirements);
  const tailoredCv = await tailorCv(
    profile,
    requirements,
    atsScore,
    offerRow.title,
    offerRow.company
  );

  const { error: insertError } = await supabase.from("tailored_cvs").insert({
    user_id: params.userId,
    base_profile_id: params.baseProfileId,
    job_offer_id: params.jobOfferId,
    content: tailoredCv,
    match_score: atsScore.score,
    matched_keywords: atsScore.matchedKeywords,
    missing_keywords: atsScore.missingKeywords,
  });

  if (insertError) {
    throw new Error(`No se pudo guardar el CV generado: ${insertError.message}`);
  }

  return { tailoredCv, atsScore };
}
