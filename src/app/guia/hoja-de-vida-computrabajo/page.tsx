import { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { GuiaRelatedLinks } from "@/components/guia/GuiaRelatedLinks";
import { FaqSchema } from "@/components/guia/FaqSchema";

export const metadata: Metadata = {
  title: "Hoja de vida para Computrabajo: qué miran primero",
  description:
    "Cómo preparar tu HV para Computrabajo en Colombia: formato ATS, palabras de la vacante y por qué un PDF genérico te deja fuera del filtro.",
  alternates: {
    canonical:
      "https://www.postulatucv.online/guia/hoja-de-vida-computrabajo",
  },
  openGraph: {
    title: "Hoja de vida para Computrabajo: qué miran primero",
    description:
      "Cómo preparar tu HV para Computrabajo en Colombia: formato ATS, palabras de la vacante y por qué un PDF genérico te deja fuera del filtro.",
    url: "https://www.postulatucv.online/guia/hoja-de-vida-computrabajo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hoja de vida para Computrabajo: qué miran primero",
    description:
      "Cómo preparar tu HV para Computrabajo en Colombia: formato ATS, palabras de la vacante y por qué un PDF genérico te deja fuera del filtro.",
  },
};

const faqs = [
  {
    question: "¿Qué miran en la hoja de vida en Computrabajo?",
    answer:
      "Perfil completo + archivo adjunto legible. Muchas empresas ordenan por coincidencia con la vacante antes de la revisión humana.",
  },
  {
    question: "¿Basta el perfil del portal sin PDF?",
    answer:
      "Mejor ambos: perfil al día y un PDF de texto alineado a esa oferta cuando postulas.",
  },
  {
    question: "¿Debo usar la misma HV en todas las vacantes?",
    answer:
      "No es lo ideal. Un maestro + una versión (o enfoque) por aviso mejora el match.",
  },
  {
    question: "¿Postula reemplaza Computrabajo?",
    answer:
      "No. Te ayuda a analizar la oferta y enfocar la HV; la postulación la haces tú en el portal.",
  },
  {
    question: "¿Puedo probar gratis?",
    answer:
      "Sí: 1 crédito al registrarte para analizar tu primera oferta.",
  },
];

export default function HojaDeVidaComputrabajoPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
      <FaqSchema faqs={faqs} />
      <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
        En Computrabajo el reclutador casi no ve tu HV primero. El filtro sí.
      </h1>

      <div className="mt-8 space-y-6 text-lg leading-relaxed text-ink-soft">
        <p>
          Muchas empresas en Colombia publican en Computrabajo y pasan las
          postulaciones por un ATS o por un orden automático. Si mandas el
          mismo archivo a veinte avisos, compites con desventaja aunque tengas
          la experiencia.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-ink">Checklist rápido</h2>
        <ul className="ml-6 list-disc space-y-2">
          <li>PDF de texto (no escaneo)</li>
          <li>Secciones claras Experiencia/Educación/Habilidades</li>
          <li>Perfil alineado al cargo de <em>esa</em> vacante</li>
          <li>Palabras de la oferta solo si son tuyas</li>
        </ul>

        <h2 className="mt-10 text-2xl font-bold text-ink">
          Un flujo que sí escala
        </h2>
        <ol className="ml-6 list-decimal space-y-2">
          <li>CV maestro</li>
          <li>
            Por cada aviso: pegas texto, ves score, bajas versión
          </li>
          <li>Postulas con el archivo correcto</li>
        </ol>

        <div className="mt-12 flex justify-center">
          <ButtonLink href="/register" className="h-12 px-8 text-[15px]">
            Analizar mi primera oferta — gratis
          </ButtonLink>
        </div>

        <GuiaRelatedLinks currentPath="/guia/hoja-de-vida-computrabajo" />
      </div>
    </article>
  );
}
