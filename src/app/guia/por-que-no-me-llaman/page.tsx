import { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { GuiaRelatedLinks } from "@/components/guia/GuiaRelatedLinks";
import { FaqSchema } from "@/components/guia/FaqSchema";

export const metadata: Metadata = {
  title: "Por qué no me llaman si mando el mismo CV",
  description:
    "Si postulas mucho y no te llaman, el primer filtro puede estar botando un HV genérico. Cómo ver el match con la oferta antes de enviar.",
  alternates: {
    canonical: "https://www.postulatucv.online/guia/por-que-no-me-llaman",
  },
  openGraph: {
    title: "Por qué no me llaman si mando el mismo CV",
    description:
      "Si postulas mucho y no te llaman, el primer filtro puede estar botando un HV genérico. Cómo ver el match con la oferta antes de enviar.",
    url: "https://www.postulatucv.online/guia/por-que-no-me-llaman",
  },
  twitter: {
    card: "summary_large_image",
    title: "Por qué no me llaman si mando el mismo CV",
    description:
      "Si postulas mucho y no te llaman, el primer filtro puede estar botando un HV genérico. Cómo ver el match con la oferta antes de enviar.",
  },
};

const faqs = [
  {
    question: "¿Por qué postulo a muchas vacantes y no me llaman?",
    answer:
      "A menudo el reclutador solo ve lo que el filtro dejó arriba. Un mismo PDF para 20 avisos distintos suele quedar mal rankeado.",
  },
  {
    question: "¿Es siempre culpa de la HV?",
    answer:
      "No. También hay cupos, timing y fit real. Pero formato ilegible y cero keywords de la oferta son causas frecuentes y arreglables.",
  },
  {
    question: "¿Qué reviso primero?",
    answer:
      "PDF de texto (no escaneo), perfil alineado al cargo de esa vacante, y palabras de la oferta que sí tengas en tu experiencia.",
  },
  {
    question: "¿Postula garantiza que me llamen?",
    answer:
      "No. Te muestra compatibilidad ATS y una versión más enfocada. La llamada depende del proceso de la empresa.",
  },
  {
    question: "¿Puedo diagnosticar mi HV sin pagar?",
    answer:
      "Sí: puedes empezar con diagnóstico de completitud al subir el PDF y 1 crédito gratis para analizar una oferta.",
  },
];

export default function PorQueNoMeLlamanPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
      <FaqSchema faqs={faqs} />
      <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
        &quot;Postulo a todo y no me llaman&quot; suele ser el filtro, no tu
        vida laboral.
      </h1>

      <div className="mt-8 space-y-6 text-lg leading-relaxed text-ink-soft">
        <p>
          El reclutador casi no ve las 200 HV. Ve las que el ATS dejó arriba.
          Un archivo único para 30 vacantes de Computrabajo es el escenario en
          el que desapareces sin entrevista.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-ink">
          Tres causas frecuentes (sin drama)
        </h2>
        <ul className="ml-6 list-disc space-y-2">
          <li>El PDF no es texto (el filtro lee poco).</li>
          <li>
            Las palabras de la oferta no aparecen, aunque sepas hacer el
            trabajo.
          </li>
          <li>
            El perfil profesional habla de &quot;otro cargo&quot; distinto al de
            esa vacante.
          </li>
        </ul>

        <h2 className="mt-10 text-2xl font-bold text-ink">Qué hacer hoy</h2>
        <p>
          No reescribas tu historia. Toma <em>una</em> oferta real, pégala,
          mira el score y las keywords faltantes. Si el hueco es real (no lo
          hiciste), esa vacante no era para estirar el CV. Si el hueco es de
          lenguaje, adapta la versión.
        </p>

        <div className="mt-12 flex justify-center">
          <ButtonLink href="/register" className="h-12 px-8 text-[15px]">
            Analizar mi primera oferta — gratis
          </ButtonLink>
        </div>

        <GuiaRelatedLinks currentPath="/guia/por-que-no-me-llaman" />
      </div>
    </article>
  );
}
