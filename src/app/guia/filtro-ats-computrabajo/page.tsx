import { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Filtro ATS en Computrabajo y Elempleo: cómo pasa tu hoja de vida",
  description:
    "Cómo leen el ATS de Computrabajo y Elempleo tu HV, qué palabras clave miran y cómo adaptar cada postulación sin inventar experiencia.",
  alternates: {
    canonical: "https://www.postulatucv.online/guia/filtro-ats-computrabajo",
  },
  openGraph: {
    title: "Filtro ATS en Computrabajo y Elempleo: cómo pasa tu hoja de vida",
    description:
      "Cómo leen el ATS de Computrabajo y Elempleo tu HV, qué palabras clave miran y cómo adaptar cada postulación sin inventar experiencia.",
    url: "https://www.postulatucv.online/guia/filtro-ats-computrabajo",
  },
  twitter: {
    card: "summary_large_image",
    title: "Filtro ATS en Computrabajo y Elempleo: cómo pasa tu hoja de vida",
    description:
      "Cómo leen el ATS de Computrabajo y Elempleo tu HV, qué palabras clave miran y cómo adaptar cada postulación sin inventar experiencia.",
  },
};

export default function FiltroAtsComputrabajoPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
      <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
        El filtro ATS de Computrabajo no odia tu experiencia. Odia el PDF
        genérico.
      </h1>

      <div className="mt-8 space-y-6 text-lg leading-relaxed text-ink-soft">
        <p>
          Si postulas a 20 vacantes con el mismo archivo, el ATS (el software
          que lee hojas de vida antes que una persona) te ordena por
          coincidencia con <em>esa</em> oferta. Un HV &quot;bonito&quot; que no
          habla el idioma de la vacante queda abajo. No es que no sirvas: es
          que el
          filtro no te encuentra.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-ink">
          Qué es un ATS, en cristiano
        </h2>
        <p>
          Un ATS extrae texto: cargo, habilidades, herramientas, ciudad.
          Compara con lo que escribió la empresa. Si la oferta dice
          &quot;atención al cliente&quot; y tú pusiste &quot;servicio al
          consumidor&quot;, a veces no hace el puente.
        </p>

        <h2 className="mt-10 text-2xl font-bold text-ink">
          Qué sí y qué no en el archivo
        </h2>
        <ul className="ml-6 list-disc space-y-2">
          <li>
            PDF de texto (no imagen, no columnas locas, no iconos que esconden
            el cargo).
          </li>
          <li>
            Títulos de sección que un filtro reconoce: Experiencia, Educación,
            Habilidades.
          </li>
          <li>
            Palabras de la oferta solo si ya están en tu trayectoria. Postula
            no las inventa; las reordena.
          </li>
        </ul>

        <h2 className="mt-10 text-2xl font-bold text-ink">
          Cómo adaptar sin mentir
        </h2>
        <ol className="ml-6 list-decimal space-y-2">
          <li>Sube tu HV maestro (no se toca).</li>
          <li>
            Pega el texto de la oferta de Computrabajo, Elempleo, LinkedIn o la
            web de la empresa.
          </li>
          <li>
            Mira el score y las palabras que te faltan. Si te faltan porque no
            las tienes, no las pongas.
          </li>
        </ol>

        <div className="mt-12 flex justify-center">
          <ButtonLink href="/register" className="h-12 px-8 text-[15px]">
            Analizar mi primera oferta — gratis
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
