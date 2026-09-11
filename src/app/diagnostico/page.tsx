import { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { CtaButton } from "@/components/public/CtaButton";
import { CheckIcon } from "@/components/ui/Icons";
import { FaqSchema } from "@/components/guia/FaqSchema";

export const metadata: Metadata = {
  title: "Diagnóstico HV gratis: qué le falta a tu hoja de vida",
  description:
    "Sube tu hoja de vida y te decimos qué le falta. Diagnóstico gratis de completitud del PDF y los huecos que te frenan al postular. Tu archivo original no se modifica.",
  alternates: {
    canonical: "https://www.postulatucv.online/diagnostico",
  },
  openGraph: {
    title: "Diagnóstico HV gratis: qué le falta a tu hoja de vida",
    description:
      "Sube tu hoja de vida y te decimos qué le falta. Diagnóstico gratis de completitud del PDF y los huecos que te frenan al postular.",
    url: "https://www.postulatucv.online/diagnostico",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diagnóstico HV gratis: qué le falta a tu hoja de vida",
    description:
      "Sube tu hoja de vida y te decimos qué le falta. Diagnóstico gratis de completitud del PDF y los huecos que te frenan al postular.",
  },
};

const faqs = [
  {
    question: "¿El diagnóstico es realmente gratis?",
    answer:
      "Sí: al subir tu PDF ves completitud y qué falta. No pedimos pago antes del diagnóstico.",
  },
  {
    question: "¿Modifican mi archivo?",
    answer: "No. El maestro no se auto-edita.",
  },
  {
    question: "¿Después qué sigue?",
    answer:
      "Si quieres, analizas una oferta con 1 crédito gratis y ves el fit ATS — sin inventar experiencia.",
  },
];

export default function DiagnosticoPage() {
  return (
    <main className="flex flex-1 flex-col">
      <FaqSchema faqs={faqs} />
      <PublicHeader />

      <section className="flex flex-col items-center gap-12 px-6 py-20 sm:py-24">
        <div className="flex max-w-2xl flex-col items-center gap-6 text-center">
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em] text-ink text-pretty">
            Sube tu hoja de vida. Te decimos qué le falta.
          </h1>
          <p className="text-lg leading-[1.6] text-muted text-pretty">
            Diagnóstico gratis: completitud del PDF y los huecos que te frenan
            al postular. Tu archivo original no se modifica.
          </p>

          <CtaButton
            location="diagnostico-hero"
            href="/register"
            className="h-12 px-7 text-[15px]"
          >
            Subir mi HV — gratis
          </CtaButton>

          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
            {[
              "Sin inventar experiencia",
              "El original no se toca",
              "Hecho para Colombia (Computrabajo y Elempleo)",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-brand" />
                <span className="text-[13.5px] font-medium text-ink-soft">
                  {t}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-center text-sm text-muted">
          Luego puedes analizar una oferta si quieres. El diagnóstico es el
          primer paso.
        </p>
      </section>

      <section className="border-t border-line bg-surface px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-3xl flex-col gap-10">
          <h2 className="text-center font-display text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-ink">
            Preguntas frecuentes
          </h2>

          <div className="flex flex-col gap-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="flex flex-col gap-2">
                <h3 className="font-display text-lg font-bold tracking-[-0.015em] text-ink">
                  {faq.question}
                </h3>
                <p className="text-[14.5px] leading-[1.6] text-muted text-pretty">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line px-6 py-16 sm:py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-7 text-center">
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] font-bold leading-[1.1] tracking-[-0.03em] text-ink">
            Empieza con el diagnóstico gratis.
          </h2>
          <CtaButton
            location="diagnostico-final"
            href="/register"
            className="h-12 px-7 text-[15px]"
          >
            Subir mi HV — gratis
          </CtaButton>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}
