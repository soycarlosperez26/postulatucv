import { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { GuiaRelatedLinks } from "@/components/guia/GuiaRelatedLinks";
import { FaqSchema } from "@/components/guia/FaqSchema";

export const metadata: Metadata = {
  title: "Adaptar hoja de vida a una oferta (sin inventar)",
  description:
    "Cómo adaptar tu HV a cada vacante en Colombia: score ATS, keywords que sí tienes y una versión por oferta. Tu archivo maestro no se modifica.",
  alternates: {
    canonical:
      "https://www.postulatucv.online/guia/adaptar-hoja-de-vida-a-una-oferta",
  },
  openGraph: {
    title: "Adaptar hoja de vida a una oferta (sin inventar)",
    description:
      "Cómo adaptar tu HV a cada vacante en Colombia: score ATS, keywords que sí tienes y una versión por oferta. Tu archivo maestro no se modifica.",
    url: "https://www.postulatucv.online/guia/adaptar-hoja-de-vida-a-una-oferta",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adaptar hoja de vida a una oferta (sin inventar)",
    description:
      "Cómo adaptar tu HV a cada vacante en Colombia: score ATS, keywords que sí tienes y una versión por oferta. Tu archivo maestro no se modifica.",
  },
};

const faqs = [
  {
    question: "¿Adaptar es mentir en la HV?",
    answer:
      "No. Es priorizar logros, herramientas y lenguaje que ya están en tu trayectoria y coinciden con esa vacante.",
  },
  {
    question: "¿Debo reescribir el CV maestro cada vez?",
    answer:
      "No. El maestro es la fuente de verdad. Por oferta se genera (o se guía) una versión enfocada; el original queda intacto.",
  },
  {
    question: "¿Sirve para Computrabajo y Elempleo?",
    answer:
      "Sí: pegas el texto de la oferta de cualquiera de esos portales (o de la web de la empresa) y comparas.",
  },
  {
    question: "¿Qué pasa si el score sale bajo?",
    answer:
      "Es información: la oferta pide algo que tu maestro no cubre. No inventes el hueco; busca otra vacante o suma evidencia real antes.",
  },
  {
    question: "¿Cuánto cuesta adaptar con Postula?",
    answer:
      "1 crédito gratis al empezar. Luego packs: 5/$10.000, 15/$20.000, 50/$50.000 COP. Sin plan mensual.",
  },
];

export default function AdaptarHojaDeVidaPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
      <FaqSchema faqs={faqs} />
      <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
        Una hoja de vida. Cada oferta, una versión.
      </h1>

      <div className="mt-8 space-y-6 text-lg leading-relaxed text-ink-soft">
        <p>
          Mandar el mismo PDF a Bancolombia, a un estudio jurídico y a una
          startup es cómodo y caro: cada filtro busca cosas distintas. Adaptar
          no es falsificar. Es poner adelante lo que ya hiciste, en el lenguaje
          de esa vacante.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-ink">El CV maestro</h2>
        <p>
          Es tu fuente de verdad. Cargos, fechas, logros. Postula no lo
          reescribe a tus espaldas. Cada oferta genera un archivo aparte.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-ink">El flujo</h2>
        <p>
          Pegas la oferta → ves compatibilidad ATS (un cálculo, no un like) →
          ves keywords cubiertas y faltantes → descargas la versión de{" "}
          <em>esa</em> vacante cuando el producto la tenga; mientras, el
          análisis ya te dice qué mover.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-ink">Qué no hacemos</h2>
        <p>
          No convertimos una recomendación en un cargo que no tuviste. Si el
          score sale bajo, es información: esa oferta pide algo que tu maestro
          no cubre.
        </p>

        <div className="mt-12 flex justify-center">
          <ButtonLink href="/register" className="h-12 px-8 text-[15px]">
            Analizar mi primera oferta — gratis
          </ButtonLink>
        </div>

        <GuiaRelatedLinks currentPath="/guia/adaptar-hoja-de-vida-a-una-oferta" />
      </div>
    </article>
  );
}
