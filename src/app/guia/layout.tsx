import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";

export default function GuiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header público */}
      <header className="flex items-center justify-between gap-4 px-6 py-5 sm:px-10">
        <Logo wordClassName="text-ink" />
        <div className="flex items-center gap-2.5">
          <ButtonLink href="/login" variant="ghost" size="sm">
            Iniciar sesión
          </ButtonLink>
          <ButtonLink href="/register" size="sm">
            Crear cuenta
          </ButtonLink>
        </div>
      </header>

      {/* Contenido de la página */}
      <main className="flex-1">{children}</main>

      {/* Footer público */}
      <footer className="border-t border-ink/10 px-6 py-8 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-muted">
              Postula — Tu CV. Cada oportunidad. Una mejor postulación. Hecho
              para el mercado laboral colombiano.
            </p>
            <ButtonLink
              href="/precios"
              variant="ghost"
              size="sm"
              className="self-start sm:self-auto"
            >
              Ver precios
            </ButtonLink>
          </div>
        </div>
      </footer>
    </div>
  );
}
