import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";

export function PublicHeader() {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-5 sm:px-10">
      <Link href="/">
        <Logo wordClassName="text-ink" />
      </Link>

      <nav className="hidden items-center gap-6 md:flex">
        <Link
          href="/#pasos"
          className="text-[14px] font-medium text-ink-soft transition hover:text-ink"
        >
          Cómo funciona
        </Link>
        <Link
          href="/precios"
          className="text-[14px] font-medium text-ink-soft transition hover:text-ink"
        >
          Precios
        </Link>
      </nav>

      <div className="flex items-center gap-2.5">
        <ButtonLink href="/login" variant="ghost" size="sm">
          Iniciar sesión
        </ButtonLink>
        <ButtonLink href="/register" size="sm">
          Crear cuenta
        </ButtonLink>
      </div>
    </header>
  );
}
