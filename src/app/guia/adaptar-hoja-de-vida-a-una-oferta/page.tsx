import { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Adaptar la hoja de vida a una oferta (sin inventar experiencia)",
  description:
    "Cómo adaptar tu HV a cada vacante en Colombia: score ATS, palabras clave que sí tienes y una versión por oferta. El original no se modifica.",
  alternates: {
    canonical:
      "https://www.postulatucv.online/guia/adaptar-hoja-de-vida-a-una-oferta",
  },
  openGraph: {
    title: "Adaptar la hoja de vida a una oferta (sin inventar experiencia)",
    description:
      "Cómo adaptar tu HV a cada vacante en Colombia: score ATS, palabras clave que sí tienes y una versión por oferta. El original no se modifica.",
    url: "https://www.postulatucv.online/guia/adaptar-hoja-de-vida-a-una-oferta",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adaptar la hoja de vida a una oferta (sin inventar experiencia)",
    description:
      "Cómo adaptar tu HV a cada vacante en Colombia: score ATS, palabras clave que sí tienes y una versión por oferta. El original no se modifica.",
  },
};

export default function AdaptarHojaDeVidaPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
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
      </div>
    </article>
  );
}
