import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { ButtonLink } from "@/components/ui/Button";

export default function GuiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex flex-1 flex-col">
      <PublicHeader />

      {children}

      <div className="border-t border-line-soft px-6 py-8 sm:px-10">
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
      </div>

      <PublicFooter />
    </main>
  );
}
