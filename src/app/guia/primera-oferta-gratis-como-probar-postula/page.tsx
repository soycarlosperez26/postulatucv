import { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { GuiaRelatedLinks } from "@/components/guia/GuiaRelatedLinks";

export const metadata: Metadata = {
  title: "Cómo probar Postula gratis: tu primera oferta con score ATS",
  description:
    "La primera oferta en Postula es gratis: sube tu HV, pega una vacante de Computrabajo o Elempleo y mira el score ATS sin tocar tu original.",
  alternates: {
    canonical:
      "https://www.postulatucv.online/guia/primera-oferta-gratis-como-probar-postula",
  },
  openGraph: {
    title: "Cómo probar Postula gratis: tu primera oferta con score ATS",
    description:
      "La primera oferta en Postula es gratis: sube tu HV, pega una vacante de Computrabajo o Elempleo y mira el score ATS sin tocar tu original.",
    url: "https://www.postulatucv.online/guia/primera-oferta-gratis-como-probar-postula",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cómo probar Postula gratis: tu primera oferta con score ATS",
    description:
      "La primera oferta en Postula es gratis: sube tu HV, pega una vacante de Computrabajo o Elempleo y mira el score ATS sin tocar tu original.",
  },
};

export default function PrimeraOfertaGratisPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
      <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
        Una oferta gratis. Sin suscripción en dólares.
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
