import type { CvProfile } from "@/types/domain";

export interface ProfileStats {
  experiences: number;
  skills: number;
  education: number;
  /** 0-100 */
  completeness: number;
  /** Lo que más conviene completar, en orden. Vacío si está completo. */
  gaps: string[];
}

/**
 * Completitud del CV Maestro. Es determinística y explicable a propósito:
 * el usuario tiene que poder ver exactamente qué le falta, igual que con
 * el score ATS. Nada de esto se le pide a la IA.
 */
export function profileStats(profile: CvProfile | null | undefined): ProfileStats {
  const p = profile ?? null;
  const experiences = p?.experience?.length ?? 0;
  const skills = p?.skills?.length ?? 0;
  const education = p?.education?.length ?? 0;

  const gaps: string[] = [];
  const checks: Array<{ ok: boolean; gap: string }> = [
    { ok: Boolean(p?.contact?.name), gap: "tu nombre completo" },
    { ok: Boolean(p?.contact?.email), gap: "un correo de contacto" },
    { ok: Boolean(p?.contact?.phone), gap: "un teléfono" },
    { ok: Boolean(p?.summary), gap: "tu perfil profesional" },
    { ok: experiences > 0, gap: "al menos una experiencia" },
    {
      ok: (p?.experience ?? []).every((e) => e.achievements.length > 0),
      gap: "los logros de una experiencia",
    },
    { ok: education > 0, gap: "tu formación" },
    { ok: skills >= 5, gap: "más habilidades (al menos 5)" },
    { ok: (p?.languages?.length ?? 0) > 0, gap: "tu nivel de idiomas" },
  ];

  for (const c of checks) if (!c.ok) gaps.push(c.gap);

  const completeness = Math.round(
    ((checks.length - gaps.length) / checks.length) * 100
  );

  return { experiences, skills, education, completeness, gaps };
}
