import type { CvProfile, JobRequirements, AtsScoreResult } from "@/types/domain";

const COMBINING_MARKS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(term: string): string {
  return term
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_MARKS_REGEX, "") // quita acentos
    .trim();
}

// Match con tolerancia a variaciones simples (ej. "react" vs "react.js")
function isMatch(candidateTerms: Set<string>, keyword: string): boolean {
  const normKeyword = normalize(keyword);
  if (!normKeyword) return false;
  for (const term of candidateTerms) {
    if (!term) continue;
    if (term === normKeyword || term.includes(normKeyword) || normKeyword.includes(term)) {
      return true;
    }
  }
  return false;
}

/**
 * Calcula el match ATS de forma determinística cruzando las
 * keywords/skills de la oferta contra el perfil del candidato.
 *
 * Deliberadamente NO le pedimos un puntaje a la IA: los ATS reales
 * (Workday, Greenhouse, Taleo, etc.) filtran por coincidencia de
 * términos exactos/parseo de secciones, no por "opinión" semántica
 * de un modelo. Esto también hace el score explicable: sabemos
 * exactamente qué keyword falta.
 */
export function computeAtsScore(
  profile: CvProfile,
  requirements: JobRequirements
): AtsScoreResult {
  const candidateTerms = new Set<string>();

  for (const skill of profile.skills) candidateTerms.add(normalize(skill));
  for (const lang of profile.languages ?? []) candidateTerms.add(normalize(lang));
  for (const cert of profile.certifications ?? []) candidateTerms.add(normalize(cert));
  for (const exp of profile.experience) {
    candidateTerms.add(normalize(exp.role));
    for (const achievement of exp.achievements) {
      candidateTerms.add(normalize(achievement));
    }
  }
  if (profile.summary) candidateTerms.add(normalize(profile.summary));

  // requiredSkills pesan más que las keywords generales; nice-to-have menos
  const weighted: Array<{ keyword: string; weight: number }> = [
    ...requirements.requiredSkills.map((k) => ({ keyword: k, weight: 2 })),
    ...requirements.keywords.map((k) => ({ keyword: k, weight: 1 })),
    ...requirements.niceToHaveSkills.map((k) => ({ keyword: k, weight: 0.5 })),
  ];

  // dedupe por término normalizado, quedándose con el mayor peso asignado
  const byTerm = new Map<string, { keyword: string; weight: number }>();
  for (const entry of weighted) {
    const key = normalize(entry.keyword);
    if (!key) continue;
    const existing = byTerm.get(key);
    if (!existing || entry.weight > existing.weight) {
      byTerm.set(key, entry);
    }
  }

  let totalWeight = 0;
  let matchedWeight = 0;
  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const { keyword, weight } of byTerm.values()) {
    totalWeight += weight;
    if (isMatch(candidateTerms, keyword)) {
      matchedWeight += weight;
      matchedKeywords.push(keyword);
    } else {
      missingKeywords.push(keyword);
    }
  }

  const score = totalWeight === 0 ? 0 : Math.round((matchedWeight / totalWeight) * 100);

  return { score, matchedKeywords, missingKeywords };
}
