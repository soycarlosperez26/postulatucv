import { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { GuiaRelatedLinks } from "@/components/guia/GuiaRelatedLinks";
import { FaqSchema } from "@/components/guia/FaqSchema";

export const metadata: Metadata = {
  title: "Formato ATS hoja de vida Colombia (guía clara)",
  description:
    "Cómo armar una HV en Colombia que un ATS pueda leer: una columna, PDF de texto, secciones estándar y keywords honestas de la vacante.",
  alternates: {
    canonical:
      "https://www.postulatucv.online/guia/formato-ats-hoja-de-vida-colombia",
  },
  openGraph: {
    title: "Formato ATS hoja de vida Colombia (guía clara)",
    description:
      "Cómo armar una HV en Colombia que un ATS pueda leer: una columna, PDF de texto, secciones estándar y keywords honestas de la vacante.",
    url: "https://www.postulatucv.online/guia/formato-ats-hoja-de-vida-colombia",
  },
  twitter: {
    card: "summary_large_image",
    title: "Formato ATS hoja de vida Colombia (guía clara)",
    description:
      "Cómo armar una HV en Colombia que un ATS pueda leer: una columna, PDF de texto, secciones estándar y keywords honestas de la vacante.",
  },
};

const faqs = [
  {
    question: "¿Qué es una hoja de vida ATS en Colombia?",
    answer:
      "Una HV con texto recuperable, secciones reconocibles (Experiencia, Educación, Habilidades) y sin adornos que rompan la lectura automática.",
  },
  {
    question: "¿PDF o plantilla con mucho diseño?",
    answer:
      "PDF de texto seleccionable, una columna. Evita tablas complejas, iconos que esconden cargos y escaneos.",
  },
  {
    question: "¿Debo poner foto y cédula?",
    answer:
      "No es obligatorio para la mayoría de postulaciones privadas; prioriza contacto claro en el cuerpo del documento.",
  },
  {
    question: "¿El formato solo basta?",
    answer:
      "No. Sin adaptar palabras reales de la oferta, un formato limpio sigue perdiendo match.",
  },
  {
    question: "¿Postula cambia el formato de mi original?",
    answer:
      "No reescribe tu maestro a tus espaldas. Analiza y ayuda a enfocar una versión por oferta sin inventar experiencia.",
  },
];

export default function FormatoAtsColombiaPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
      <FaqSchema faqs={faqs} />
      <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
        Formato ATS: claro para la máquina, honesto para el reclutador.
      </h1>

      <div className="mt-8 space-y-6 text-lg leading-relaxed text-ink-soft">
        <p>
          En Colombia la HV sigue siendo el documento base. Lo que cambió es
          quién la lee primero. Un formato ATS no es una plantilla mágica: es
          texto recuperable, secciones estándar y el lenguaje de la vacante.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-ink">
          Estructura que sí leen
        </h2>
        <p>
          Nombre y contacto en el cuerpo (no solo en el encabezado). Perfil
          corto. Experiencia de la más reciente a la más vieja, con logros.
          Educación. Habilidades con nombres de herramientas reales. Ciudad.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-ink">
          Lo que suele romper el filtro
        </h2>
        <p>
          Tablas, dos columnas, iconos, texto en imagen, headers/footers con el
          teléfono. PDF escaneado.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-ink">Palabras clave</h2>
        <p>
          Copia de la oferta los términos que <em>ya aplican</em>. No metas
          &quot;Python&quot; si no lo usaste. Postula te muestra el delta; tú
          decides.
        </p>

        <div className="mt-12 flex justify-center">
          <ButtonLink href="/register" className="h-12 px-8 text-[15px]">
            Analizar mi primera oferta — gratis
          </ButtonLink>
        </div>

        <div className="mt-16 border-t border-line-soft pt-10">
          <h2 className="text-2xl font-bold text-ink">Preguntas frecuentes</h2>
          <div className="mt-6 flex flex-col gap-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="flex flex-col gap-2">
                <h3 className="text-lg font-bold text-ink">{faq.question}</h3>
                <p className="text-[15px] leading-[1.6] text-ink-soft">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        <GuiaRelatedLinks currentPath="/guia/formato-ats-hoja-de-vida-colombia" />
      </div>
    </article>
  );
}
