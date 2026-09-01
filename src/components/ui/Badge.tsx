export type BadgeTone = "brand" | "amber" | "clay" | "neutral";

const tones: Record<BadgeTone, string> = {
  brand: "bg-brand-tint text-brand",
  amber: "bg-amber-tint text-amber-ink",
  clay: "bg-clay-tint text-clay",
  neutral: "bg-line-soft text-muted",
};

export function Badge({
  tone = "neutral",
  className = "",
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-[7px] px-2.5 py-1 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/** Palabra clave de la oferta que ya aparece en el CV. */
export function KeywordChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg border border-brand-line bg-brand-tint px-2.5 py-1.5 text-[13px] font-semibold text-brand">
      {children}
    </span>
  );
}
