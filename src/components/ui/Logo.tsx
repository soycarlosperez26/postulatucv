/** Marca de Postula: la P dibujada dentro del cuadrado ámbar. */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className} aria-hidden="true">
      <rect width="28" height="28" rx="8.5" className="fill-amber" />
      <path
        d="M9.6 19.5V11.4C9.6 10.1 10.7 9 12 9h2.9c2 0 3.6 1.6 3.6 3.6s-1.6 3.6-3.6 3.6h-2.5"
        className="stroke-forest"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  className = "",
  wordClassName = "text-cream",
}: {
  className?: string;
  wordClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark />
      <span
        className={`font-display text-[21px] font-bold tracking-[-0.02em] ${wordClassName}`}
      >
        Postula
      </span>
    </span>
  );
}
