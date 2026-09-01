import { JobRequirementsSchema, type JobRequirements } from "@/types/domain";
import { callDeepSeekTool } from "./deepseek";

const JOB_REQUIREMENTS_INPUT_SCHEMA = {
  type: "object",
  properties: {
    seniority: { type: "string" },
    requiredSkills: { type: "array", items: { type: "string" } },
    niceToHaveSkills: { type: "array", items: { type: "string" } },
    keywords: {
      type: "array",
      items: { type: "string" },
      description:
        "Todas las palabras clave relevantes para un ATS: tecnologías, " +
        "certificaciones, metodologías, herramientas, idiomas, títulos.",
    },
    responsibilities: { type: "array", items: { type: "string" } },
  },
  required: ["requiredSkills", "keywords"],
} as const;

/**
 * Convierte la descripción cruda de una oferta en requisitos
 * estructurados. Es la base del cálculo determinístico del score ATS
 * (ver computeAtsScore.ts).
 */
export async function extractJobRequirements(
  rawDescription: string
): Promise<JobRequirements> {
  const raw = await callDeepSeekTool({
    system:
      "Eres un analista de reclutamiento. Extrae los requisitos y " +
      "keywords de una oferta de empleo tal como los buscaría un ATS " +
      "(sistema de seguimiento de candidatos): términos exactos, " +
      "tecnologías, certificaciones y habilidades mencionadas en el texto.",
    prompt: `Extrae los requisitos estructurados de esta oferta de empleo:\n\n${rawDescription}`,
    toolName: "extract_job_requirements",
    toolDescription: "Guarda los requisitos estructurados de la oferta.",
    inputSchema: JOB_REQUIREMENTS_INPUT_SCHEMA,
    maxTokens: 2048,
  });

  const parsed = JobRequirementsSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `La oferta extraída no tiene el formato esperado: ${parsed.error.message}`
    );
  }
  return parsed.data;
}
