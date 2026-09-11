import { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { GuiaRelatedLinks } from "@/components/guia/GuiaRelatedLinks";
import { FaqSchema } from "@/components/guia/FaqSchema";

export const metadata: Metadata = {
  title: "Palabras clave ATS: cómo usarlas sin inventar experiencia",
  description:
    "Cómo sacar palabras clave de una oferta de Computrabajo o Elempleo e integrarlas en tu HV solo si ya las tienes. Score ATS honesto.",
  alternates: {
    canonical:
      "https://www.postulatucv.online/guia/palabras-clave-ats-sin-inventar",
  },
  openGraph: {
    title: "Palabras clave ATS: cómo usarlas sin inventar experiencia",
    description:
      "Cómo sacar palabras clave de una oferta de Computrabajo o Elempleo e integrarlas en tu HV solo si ya las tienes. Score ATS honesto.",
    url: "https://www.postulatucv.online/guia/palabras-clave-ats-sin-inventar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Palabras clave ATS: cómo usarlas sin inventar experiencia",
    description:
      "Cómo sacar palabras clave de una oferta de Computrabajo o Elempleo e integrarlas en tu HV solo si ya las tienes. Score ATS honesto.",
  },
};

const faqs = [
  {
    question: "¿De dónde salen las palabras clave ATS?",
    answer:
      "Del texto de la vacante: herramientas, verbos de la función, certificaciones pedidas. Debes pegar el texto completo de la oferta, no solo el título.",
  },
  {
    question: "¿Qué hago si me faltan palabras clave?",
    answer:
      "Si el score marca huecos reales, esa oferta pide algo que tu trayectoria no cubre. No las inventes. Busca otra vacante o suma evidencia real (un curso, un logro) en tu CV maestro antes de volver a analizar.",
  },
  {
    question: "¿Qué hace Postula con las palabras clave?",
    answer:
      "Postula compara tu HV maestro con la oferta, te muestra las palabras cubiertas vs. faltantes y arma una versión enfocada. Tu CV original no se modifica.",
  },
];

export default function PalabrasClaveAtsSinInventarPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
      <FaqSchema faqs={faqs} />
      <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
        Las palabras clave del ATS no se inventan. Se reordenan.
      </h1>

      <div className="mt-8 space-y-6 text-lg leading-relaxed text-ink-soft">
        <p>
          El filtro busca coincidencias de texto. Meter &quot;Python&quot; o
          &quot;liderazgo de equipos&quot; porque salen en la vacante, si nunca
          los usaste, es mentira — y Postula no lo hace. Adaptar es poner
          adelante lo que ya está en tu CV maestro, con el idioma de esa
          oferta.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-ink">
          De dónde salen las keywords
        </h2>
        <p>
          Del texto de la vacante: herramientas, verbos de la función,
          certificaciones pedidas. Pégalo completo; no solo el título.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-ink">
          Qué hacer con las que te faltan
        </h2>
        <p>
          Si el score marca huecos reales, esa oferta pide algo que tu
          trayectoria no cubre. No los inventes. Busca otra vacante o suma
          evidencia real (un curso, un logro) en el maestro antes de volver a
          analizar.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-ink">Qué hace Postula</h2>
        <p>
          Compara tu HV maestro con la oferta, te muestra cubiertas vs.
          faltantes y arma una versión enfocada. El original no se toca.
        </p>

        <div className="mt-12 flex justify-center">
          <ButtonLink href="/register" className="h-12 px-8 text-[15px]">
            Analizar mi primera oferta — gratis
          </ButtonLink>
        </div>

        <GuiaRelatedLinks currentPath="/guia/palabras-clave-ats-sin-inventar" />
      </div>
    </article>
  );
}
