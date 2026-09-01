import {
  TailoredCvContentSchema,
  type TailoredCvContent,
  type CvProfile,
  type JobRequirements,
  type AtsScoreResult,
} from "@/types/domain";
import { callDeepSeekTool } from "./deepseek";

const TAILORED_CV_INPUT_SCHEMA = {
  type: "object",
  properties: {
    contact: {
      type: "object",
      properties: {
        name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        location: { type: "string" },
        links: { type: "array", items: { type: "string" } },
      },
      required: ["name"],
    },
    summary: {
      type: "string",
      description:
        "Resumen profesional de 2-4 líneas adaptado a esta oferta, " +
        "usando solo hechos reales del perfil base.",
    },
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          company: { type: "string" },
          role: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: "string" },
          current: { type: "boolean" },
          achievements: {
            type: "array",
            items: { type: "string" },
            description:
              "Logros reescritos priorizando los relevantes para la " +
              "oferta. No inventar logros nuevos, solo reformular/priorizar.",
          },
        },
        required: ["company", "role", "achievements"],
      },
    },
    education: {
      type: "array",
      items: {
        type: "object",
        properties: {
          institution: { type: "string" },
          degree: { type: "string" },
          field: { type: "string" },
          startDate: { type: "string" },
          endDate: { type: "string" },
        },
        required: ["institution"],
      },
    },
    skills: {
      type: "array",
      items: { type: "string" },
      description:
        "Las mismas skills del perfil original, reordenadas: primero " +
        "las que coinciden con la oferta.",
    },
  },
  required: ["contact", "summary", "experience", "education", "skills"],
} as const;

/**
 * Reescribe/reordena el CV base priorizando lo relevante para una
 * oferta específica. Restringido explícitamente a no inventar hechos
 * que no estén en el perfil base.
 */
export async function tailorCv(
  profile: CvProfile,
  requirements: JobRequirements,
  atsScore: AtsScoreResult,
  jobTitle: string,
  company: string
): Promise<TailoredCvContent> {
  const raw = await callDeepSeekTool({
    system:
      "Eres un editor experto de CVs para pasar filtros de ATS. Tu única " +
      "fuente de verdad es el perfil base que se te entrega: no puedes " +
      "inventar empresas, cargos, fechas, títulos ni logros que no estén " +
      "en ese perfil. Tu trabajo es reordenar, priorizar y reescribir " +
      "(sin inventar hechos) para maximizar la relevancia frente a la " +
      "oferta, incorporando de forma natural las keywords de la oferta " +
      "que sí correspondan a experiencia real del candidato.",
    prompt: [
      `Oferta: ${jobTitle} en ${company}.`,
      `Requisitos de la oferta: ${JSON.stringify(requirements)}`,
      `Keywords que hoy no calzan con el perfil (solo destácalas si el ` +
        `candidato realmente tiene esa experiencia; si no la tiene, no la ` +
        `inventes): ${atsScore.missingKeywords.join(", ") || "ninguna"}`,
      `Perfil base del candidato: ${JSON.stringify(profile)}`,
    ].join("\n\n"),
    toolName: "generate_tailored_cv",
    toolDescription: "Guarda el CV adaptado a la oferta.",
    inputSchema: TAILORED_CV_INPUT_SCHEMA,
    maxTokens: 4096,
  });

  const parsed = TailoredCvContentSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `El CV generado no tiene el formato esperado: ${parsed.error.message}`
    );
  }
  return parsed.data;
}
