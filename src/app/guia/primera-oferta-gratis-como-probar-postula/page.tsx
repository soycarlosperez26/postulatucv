import { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { GuiaRelatedLinks } from "@/components/guia/GuiaRelatedLinks";
import { FaqSchema } from "@/components/guia/FaqSchema";

export const metadata: Metadata = {
  title: "Cómo probar Postula gratis: 1 crédito, sin Pro",
  description:
    "La primera oferta en Postula es gratis: sube tu HV, pega una vacante de Computrabajo o Elempleo y mira el score ATS. Packs en COP, sin plan mensual.",
  alternates: {
    canonical:
      "https://www.postulatucv.online/guia/primera-oferta-gratis-como-probar-postula",
  },
  openGraph: {
    title: "Cómo probar Postula gratis: 1 crédito, sin Pro",
    description:
      "La primera oferta en Postula es gratis: sube tu HV, pega una vacante de Computrabajo o Elempleo y mira el score ATS. Packs en COP, sin plan mensual.",
    url: "https://www.postulatucv.online/guia/primera-oferta-gratis-como-probar-postula",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cómo probar Postula gratis: 1 crédito, sin Pro",
    description:
      "La primera oferta en Postula es gratis: sube tu HV, pega una vacante de Computrabajo o Elempleo y mira el score ATS. Packs en COP, sin plan mensual.",
  },
};

const faqs = [
  {
    question: "¿Qué incluye el crédito gratis?",
    answer:
      "Analizar una oferta contra tu HV maestro: compatibilidad ATS, keywords cubiertas/faltantes y enfoque de postulación. El original no se toca.",
  },
  {
    question: "¿Qué son los créditos CV en Postula?",
    answer:
      "Unidades para analizar ofertas. Compras packs; no hay Pro mensual.",
  },
  {
    question: "¿Cuánto cuestan los packs?",
    answer:
      "5 créditos $10.000 · 15 créditos $20.000 · 50 créditos $50.000 COP (precios live en /precios).",
  },
  {
    question: "¿Los créditos vencen?",
    answer:
      "Los comprados no vencen (según política publicada en precios). El gratis es para probar.",
  },
  {
    question: "¿Inventan experiencia para subir el score?",
    answer:
      "No. Si falta evidencia real, el score lo refleja. Tú decides.",
  },
];

export default function PrimeraOfertaGratisPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
      <FaqSchema faqs={faqs} />
      <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
        Una oferta gratis. Créditos en pesos. Sin suscripción mensual.
      </h1>

      <div className="mt-8 space-y-6 text-lg leading-relaxed text-ink-soft">
        <p>
          Postula está hecho para Colombia: packs en COP, sin inventar
          experiencia. Al crear cuenta tienes 1 crédito (una oferta analizada).
          Sirve para ver si el score y el CV adaptado te sirven de verdad.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-ink">Qué vas a ver</h2>
        <ul className="ml-6 list-disc space-y-2">
          <li>Compatibilidad ATS</li>
          <li>Palabras cubiertas vs faltantes</li>
          <li>Versión enfocada (maestro intacto)</li>
        </ul>

        <h2 className="mt-10 text-2xl font-bold text-ink">Después</h2>
        <p>
          Packs desde $10.000 (5 créditos). 15 créditos = $20.000. Los
          comprados no vencen. Sin plan mensual.
        </p>

        <div className="mt-12 flex justify-center">
          <ButtonLink href="/register" className="h-12 px-8 text-[15px]">
            Analizar mi primera oferta — gratis
          </ButtonLink>
        </div>

        <GuiaRelatedLinks currentPath="/guia/primera-oferta-gratis-como-probar-postula" />
      </div>
    </article>
  );
}
