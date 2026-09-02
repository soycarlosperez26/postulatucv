import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { CheckIcon } from "@/components/ui/Icons";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { CtaButton } from "@/components/public/CtaButton";
import { formatCop } from "@/lib/plan";

export default async function HomePage() {
  let user = null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();
    user = fetchedUser;

    if (user) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="flex flex-1 flex-col">
      <PublicHeader />

      {/* Héroe */}
      <section className="flex flex-col items-center gap-9 px-6 py-20 text-center sm:py-24">
        <div className="flex max-w-2xl flex-col gap-5">
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em] text-ink text-pretty">
            Tu CV. Cada oportunidad.
            <br />
            Una mejor postulación.
          </h1>
          <p className="text-lg leading-[1.6] text-muted text-pretty">
            Sube tu hoja de vida una vez. Por cada oferta de Computrabajo,
            Elempleo o LinkedIn, Postula te da un score ATS, las palabras clave
            que te faltan y un CV enfocado en esa vacante.
          </p>
        </div>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <CtaButton
            location="hero"
            href="/register"
            className="h-12 px-7 text-[15px]"
          >
            Analizar mi primera oferta — gratis
          </CtaButton>
          <Link
            href="#pasos"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-control px-7 text-[15px] font-semibold text-ink-soft transition hover:text-ink"
          >
            Ver cómo funciona
          </Link>
        </div>

        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
          {[
            "Tu CV original nunca se modifica",
            "Score ATS calculado, no opinado",
            "Hecho para Colombia",
          ].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-brand" />
              <span className="text-[13.5px] font-medium text-ink-soft">
                {t}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Cómo funciona */}
      <section
        id="pasos"
        className="border-t border-line bg-surface px-6 py-16 sm:py-20"
      >
        <div className="mx-auto flex max-w-4xl flex-col gap-12">
          <div className="flex flex-col gap-3 text-center">
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-ink">
              Tres pasos. Sin inventar experiencia.
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <div className="flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-surface">
                <span className="font-display text-lg font-bold">1</span>
              </div>
              <h3 className="font-display text-lg font-bold tracking-[-0.015em] text-ink">
                Sube tu CV maestro
              </h3>
              <p className="text-[14.5px] leading-[1.6] text-muted text-pretty">
                PDF. Ese archivo es la fuente de verdad. Postula no lo reescribe
                a tus espaldas.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-surface">
                <span className="font-display text-lg font-bold">2</span>
              </div>
              <h3 className="font-display text-lg font-bold tracking-[-0.015em] text-ink">
                Pega la oferta
              </h3>
              <p className="text-[14.5px] leading-[1.6] text-muted text-pretty">
                El texto de la vacante, el link, o lo que publicaron. Postula
                compara lo que tú sí tienes con lo que piden.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-surface">
                <span className="font-display text-lg font-bold">3</span>
              </div>
              <h3 className="font-display text-lg font-bold tracking-[-0.015em] text-ink">
                Recibe score + CV de esa vacante
              </h3>
              <p className="text-[14.5px] leading-[1.6] text-muted text-pretty">
                Ves el match con el filtro ATS, las palabras que te faltan y una
                versión lista para postular. El original sigue intacto.
              </p>
            </div>
          </div>

          <p className="text-center text-sm font-medium text-brand">
            La primera oferta es gratis.
          </p>
        </div>
      </section>

      {/* Demo */}
      <section className="border-t border-line px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-4xl flex-col gap-10">
          <h2 className="text-center font-display text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-ink">
            El score no es un like. Es un cálculo.
          </h2>

          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="flex flex-col gap-4 px-5 py-6">
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-rust">
                  Compatibilidad ATS
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold text-clay">
                    42%
                  </span>
                  <span className="text-xl text-muted">→</span>
                  <span className="font-display text-3xl font-bold text-brand">
                    78%
                  </span>
                </div>
              </div>
              <p className="text-[13.5px] leading-[1.5] text-muted text-pretty">
                Mismo candidato. El CV adaptado cruza el filtro.
              </p>
            </Card>

            <Card className="flex flex-col gap-4 px-5 py-6">
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-rust">
                  Palabras clave
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold text-brand">
                    12
                  </span>
                  <span className="text-muted">cubiertas</span>
                </div>
              </div>
              <p className="text-[13.5px] leading-[1.5] text-muted text-pretty">
                Las que el ATS busca y encontró en tu CV adaptado.
              </p>
            </Card>

            <Card className="flex flex-col gap-4 px-5 py-6">
              <div className="flex flex-col gap-2">
                <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-rust">
                  CV adaptado
                </span>
                <span className="font-display text-3xl font-bold text-ink">
                  Listo
                </span>
              </div>
              <p className="text-[13.5px] leading-[1.5] text-muted text-pretty">
                Versión enfocada en esa oferta. El maestro sigue intacto.
              </p>
            </Card>
          </div>

          <p className="text-center text-[14.5px] font-medium text-ink-soft">
            Mismo candidato. Misma experiencia. Mejor postulación.
          </p>
        </div>
      </section>

      {/* Para quién */}
      <section className="border-t border-line bg-surface px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          <h2 className="text-center font-display text-[clamp(1.75rem,4vw,2.25rem)] font-bold leading-[1.15] tracking-[-0.03em] text-ink text-pretty">
            Si estás mandando el mismo PDF a 30 vacantes, el filtro te está
            botando antes del reclutador.
          </h2>

          <ul className="flex flex-col gap-4">
            {[
              "Buscas empleo o quieres cambiar",
              "Postulas en Computrabajo, Elempleo, LinkedIn u ofertas de empresa",
              "No quieres que una IA te invente un cargo que no tuviste",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckIcon className="mt-1 h-5 w-5 shrink-0 text-brand" />
                <span className="text-[15px] leading-[1.6] text-ink-soft">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Qué no hace */}
      <section className="border-t border-line px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          <h2 className="text-center font-display text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-ink">
            Una línea que no cruzamos.
          </h2>

          <div className="flex flex-col gap-6">
            {[
              "No convertimos una recomendación en experiencia falsa",
              "No tocamos tu CV maestro",
              "No prometemos que te van a llamar. Prometemos que esa oferta te ve como eres, en el idioma de esa vacante",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-card border border-line bg-surface px-5 py-4"
              >
                <span className="mt-0.5 text-xl">✗</span>
                <p className="text-[14.5px] leading-[1.6] text-ink-soft text-pretty">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Precios */}
      <section className="border-t border-line bg-surface px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-4xl flex-col gap-10">
          <div className="flex flex-col gap-3 text-center">
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-ink">
              Empieza gratis. Compra créditos cuando te sirva.
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-4">
            <Card className="flex flex-col gap-4 px-5 py-5">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-muted">
                  Gratis
                </span>
                <span className="font-display text-[32px] font-bold leading-none tracking-[-0.03em] text-ink">
                  $0
                </span>
              </div>
              <p className="text-[13.5px] text-muted">1 crédito al crear cuenta</p>
            </Card>

            <Card className="flex flex-col gap-4 px-5 py-5">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-rust">
                  5 créditos
                </span>
                <span className="font-display text-[32px] font-bold leading-none tracking-[-0.03em] text-ink">
                  {formatCop(10000)}
                </span>
              </div>
              <p className="text-[13.5px] text-muted">Para empezar</p>
            </Card>

            <Card className="flex flex-col gap-4 border-brand px-5 py-5 ring-1 ring-brand">
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-rust">
                    15 créditos
                  </span>
                  <span className="font-display text-[32px] font-bold leading-none tracking-[-0.03em] text-ink">
                    {formatCop(20000)}
                  </span>
                </div>
              </div>
              <Badge tone="brand">Mejor para empezar</Badge>
            </Card>

            <Card className="flex flex-col gap-4 px-5 py-5">
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-rust">
                  50 créditos
                </span>
                <span className="font-display text-[32px] font-bold leading-none tracking-[-0.03em] text-ink">
                  {formatCop(50000)}
                </span>
              </div>
              <Badge tone="neutral">Mejor valor</Badge>
            </Card>
          </div>

          <div className="flex flex-col items-center gap-4">
            <CtaButton
              location="pricing"
              href="/register"
              className="h-11 px-6"
            >
              Crear cuenta gratis
            </CtaButton>
            <Link
              href="/precios"
              className="text-[14px] font-semibold text-brand transition hover:text-brand-bar"
            >
              Ver precios
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-line px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          <h2 className="text-center font-display text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-ink">
            Preguntas frecuentes
          </h2>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-lg font-bold tracking-[-0.015em] text-ink">
                ¿Sirve para Computrabajo y Elempleo?
              </h3>
              <p className="text-[14.5px] leading-[1.6] text-muted text-pretty">
                Sí. Pegas el texto de la oferta (Computrabajo, Elempleo, LinkedIn
                o la web de la empresa).
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-display text-lg font-bold tracking-[-0.015em] text-ink">
                ¿Inventa experiencia?
              </h3>
              <p className="text-[14.5px] leading-[1.6] text-muted text-pretty">
                No. Reordena y reescribe a partir del CV maestro. No inventa
                cargos.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-display text-lg font-bold tracking-[-0.015em] text-ink">
                ¿Modifica el CV original?
              </h3>
              <p className="text-[14.5px] leading-[1.6] text-muted text-pretty">
                No. El maestro no se toca. Cada vacante genera una versión
                aparte.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="font-display text-lg font-bold tracking-[-0.015em] text-ink">
                ¿La primera oferta es gratis?
              </h3>
              <p className="text-[14.5px] leading-[1.6] text-muted text-pretty">
                Sí. Al crear cuenta tienes 1 crédito. Ese crédito de bienvenida se
                renueva cada mes y no se acumula. Los créditos comprados no
                vencen. Analizar una oferta gasta 1 crédito. Subir el CV maestro
                no gasta crédito.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="border-t border-line bg-surface px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-7 text-center">
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-ink">
            Deja de postular a ciegas.
          </h2>
          <p className="text-lg leading-[1.6] text-muted text-pretty">
            Sube tu CV. Pega la oferta. Mira el score antes de enviar.
          </p>
          <CtaButton
            location="final"
            href="/register"
            className="h-12 px-7 text-[15px]"
          >
            Analizar mi primera oferta — gratis
          </CtaButton>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
