import { CvProfileSchema, type CvProfile } from "@/types/domain";
import { callDeepSeekTool } from "./deepseek";

const CV_PROFILE_INPUT_SCHEMA = {
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
    summary: { type: "string" },
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
          achievements: { type: "array", items: { type: "string" } },
        },
        required: ["company", "role"],
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
    skills: { type: "array", items: { type: "string" } },
    languages: { type: "array", items: { type: "string" } },
    certifications: { type: "array", items: { type: "string" } },
  },
  required: ["contact", "experience", "education", "skills"],
} as const;

/**
 * Convierte el texto plano de un CV en un perfil estructurado.
 * Se ejecuta una sola vez, en el onboarding.
 */
export async function extractCvProfile(rawText: string): Promise<CvProfile> {
  const raw = await callDeepSeekTool({
    system:
      "Eres un extractor de datos de CVs. Extrae únicamente información " +
      "que esté explícitamente presente en el texto. Nunca inventes " +
      "empresas, cargos, fechas ni logros que no aparezcan en el CV. Si " +
      "un dato no está, deja el campo vacío.",
    prompt: `Extrae la información estructurada de este CV:\n\n${rawText}`,
    toolName: "extract_cv_profile",
    toolDescription: "Guarda el perfil estructurado extraído del CV.",
    inputSchema: CV_PROFILE_INPUT_SCHEMA,
    maxTokens: 4096,
  });

  const parsed = CvProfileSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(
      `El CV extraído no tiene el formato esperado: ${parsed.error.message}`
    );
  }
  return parsed.data;
}
