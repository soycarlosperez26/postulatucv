import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function PublicFooter() {
  return (
    <footer className="border-t border-line bg-surface px-6 py-10 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-3">
            <Logo wordClassName="text-ink" />
            <p className="text-[13.5px] text-muted">
              Hecho para el mercado laboral colombiano
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[14px]">
            <Link
              href="/#pasos"
              className="font-medium text-ink-soft transition hover:text-ink"
            >
              Cómo funciona
            </Link>
            <Link
              href="/precios"
              className="font-medium text-ink-soft transition hover:text-ink"
            >
              Precios
            </Link>
            <Link
              href="/privacidad"
              className="font-medium text-ink-soft transition hover:text-ink"
            >
              Privacidad
            </Link>
            <Link
              href="/terminos"
              className="font-medium text-ink-soft transition hover:text-ink"
            >
              Términos
            </Link>
          </nav>
        </div>

        <div className="border-t border-line-soft pt-6">
          <p className="text-[12.5px] text-muted">© 2026 Postula</p>
        </div>
      </div>
    </footer>
  );
}
