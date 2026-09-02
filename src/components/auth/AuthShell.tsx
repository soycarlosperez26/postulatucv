import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

/**
 * Marco de las pantallas fuera del dashboard (login, registro,
 * onboarding): banda verde a la izquierda con la promesa del producto,
 * formulario a la derecha.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col lg:flex-row">
      <aside className="flex flex-col justify-between gap-10 bg-forest px-8 py-8 lg:w-[420px] lg:px-12 lg:py-12">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>
        <div className="hidden flex-col gap-4 lg:flex">
          <p className="font-display text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-cream text-pretty">
            Tu CV. Cada oportunidad. Una mejor postulación.
          </p>
          <p className="text-sm leading-[1.6] text-forest-ink text-pretty">
            Subes tu hoja de vida una vez. Para cada oferta, Postula te dice qué
            tan compatible eres con el filtro ATS, qué palabras clave te faltan
            y arma una versión enfocada en esa vacante — sin tocar tu original.
          </p>
        </div>
        <p className="hidden text-xs text-forest-ink/70 lg:block">
          Hecho para el mercado laboral colombiano.
        </p>
      </aside>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="flex w-full max-w-sm flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted text-pretty">{subtitle}</p>
            )}
          </div>
          {children}
          {footer}
        </div>
      </div>
    </main>
  );
}
