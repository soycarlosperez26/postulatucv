export const inputClass =
  "w-full rounded-control border border-line bg-canvas px-3 py-2.5 text-sm text-ink placeholder:text-faint outline-none transition focus:border-brand focus:bg-surface";

export function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-ink-soft">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted text-pretty">{hint}</p>}
    </div>
  );
}
