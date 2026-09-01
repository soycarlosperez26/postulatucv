export function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-card border border-line bg-surface ${className}`}
    >
      {children}
    </section>
  );
}

export function CardTitle({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      className={`font-display text-[16px] font-bold tracking-[-0.01em] text-ink ${className}`}
    >
      {children}
    </h2>
  );
}

/** Etiqueta pequeña en versalitas: "TU CV MAESTRO", "CRÉDITOS". */
export function Eyebrow({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`text-[11px] font-bold uppercase tracking-[0.1em] ${className}`}
    >
      {children}
    </span>
  );
}
