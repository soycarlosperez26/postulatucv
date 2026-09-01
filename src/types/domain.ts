import { z } from "zod";

// ============================================================
// CvProfile: la representación estructurada del CV base del
// usuario, extraída una vez en el onboarding.
// ============================================================
export const CvProfileSchema = z.object({
  contact: z.object({
    name: z.string(),
    email: z.string().optional().default(""),
    phone: z.string().optional().default(""),
    location: z.string().optional().default(""),
    links: z.array(z.string()).optional().default([]),
  }),
  summary: z.string().optional().default(""),
  experience: z
    .array(
      z.object({
        company: z.string(),
        role: z.string(),
        startDate: z.string().optional().default(""),
        endDate: z.string().optional().default(""),
        current: z.boolean().optional().default(false),
        achievements: z.array(z.string()).default([]),
      })
    )
    .default([]),
  education: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string().optional().default(""),
        field: z.string().optional().default(""),
        startDate: z.string().optional().default(""),
        endDate: z.string().optional().default(""),
      })
    )
    .default([]),
  skills: z.array(z.string()).default([]),
  languages: z.array(z.string()).optional().default([]),
  certifications: z.array(z.string()).optional().default([]),
});
export type CvProfile = z.infer<typeof CvProfileSchema>;

// ============================================================
// JobRequirements: lo que se extrae de la oferta de empleo.
// Es la base determinística del score ATS.
// ============================================================
export const JobRequirementsSchema = z.object({
  seniority: z.string().optional().default(""),
  requiredSkills: z.array(z.string()).default([]),
  niceToHaveSkills: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
});
export type JobRequirements = z.infer<typeof JobRequirementsSchema>;

// ============================================================
// TailoredCvContent: el CV reescrito/priorizado para una oferta
// específica. Mismo shape que CvProfile para poder renderizarlo
// con el mismo componente.
// ============================================================
export const TailoredCvContentSchema = z.object({
  contact: CvProfileSchema.shape.contact,
  summary: z.string(),
  experience: CvProfileSchema.shape.experience,
  education: CvProfileSchema.shape.education,
  skills: z.array(z.string()),
});
export type TailoredCvContent = z.infer<typeof TailoredCvContentSchema>;

// ============================================================
// Resultado completo de generar un CV a medida
// ============================================================
export interface AtsScoreResult {
  score: number; // 0-100
  matchedKeywords: string[];
  missingKeywords: string[];
}

export interface GenerateCustomCvResult {
  tailoredCv: TailoredCvContent;
  atsScore: AtsScoreResult;
}
