/**
 * Bandas del match ATS. El color no es decorativo: comunica si el perfil
 * pasa o no el corte típico de un filtro automático (~75%).
 *
 * Fuente única para el dashboard, el detalle de oferta y el CV adaptado.
 */
export type ScoreBand = "alto" | "medio" | "bajo" | "sin";

export interface ScoreStyle {
  band: ScoreBand;
  /** color del número / etiqueta */
  text: string;
  /** relleno de la barra */
  bar: string;
  /** trazo del anillo (mismo color que `bar`) */
  stroke: string;
  label: string;
}

export function scoreBand(score: number | null | undefined): ScoreStyle {
  if (score === null || score === undefined) {
    return {
      band: "sin",
      text: "text-faint",
      bar: "bg-line-strong",
      stroke: "stroke-line-strong",
      label: "—",
    };
  }
  const rounded = Math.round(score);
  if (rounded >= 80) {
    return {
      band: "alto",
      text: "text-brand",
      bar: "bg-brand-bar",
      stroke: "stroke-brand-bar",
      label: `${rounded}%`,
    };
  }
  if (rounded >= 65) {
    return {
      band: "medio",
      text: "text-amber-ink",
      bar: "bg-amber",
      stroke: "stroke-amber",
      label: `${rounded}%`,
    };
  }
  return {
    band: "bajo",
    text: "text-clay",
    bar: "bg-clay-bar",
    stroke: "stroke-clay-bar",
    label: `${rounded}%`,
  };
}

/** Titular honesto para el detalle de oferta. */
export function scoreHeadline(score: number): string {
  if (score >= 80) return "Perfil fuerte para esta oferta";
  if (score >= 65) return "Competitivo, con vacíos que puedes cerrar";
  return "Vas a competir en desventaja";
}
