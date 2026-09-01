export function Meter({
  value,
  barClass = "bg-brand",
  className = "",
  height = "h-2",
}: {
  /** 0-100 */
  value: number;
  barClass?: string;
  className?: string;
  height?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={`${height} overflow-hidden rounded-full bg-sunken ${className}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full ${barClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Anillo del match ATS. `strokeClass` viene de scoreBand(). */
export function ScoreRing({
  score,
  strokeClass,
  caption = "Match ATS",
}: {
  score: number;
  strokeClass: string;
  caption?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <div className="relative h-[132px] w-[132px] shrink-0">
      <svg viewBox="0 0 132 132" className="h-full w-full -rotate-90">
        <circle
          cx="66"
          cy="66"
          r={RADIUS}
          fill="none"
          className="stroke-sunken"
          strokeWidth="12"
        />
        <circle
          cx="66"
          cy="66"
          r={RADIUS}
          fill="none"
          className={strokeClass}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - pct / 100)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-[34px] font-bold leading-none tracking-[-0.03em] text-ink">
          {pct}%
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-muted-soft">
          {caption}
        </span>
      </div>
    </div>
  );
}
