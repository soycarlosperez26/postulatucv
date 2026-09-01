export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="rounded-[10px] border border-clay/20 bg-clay-tint px-3 py-2 text-sm text-clay text-pretty">
      {message}
    </p>
  );
}
