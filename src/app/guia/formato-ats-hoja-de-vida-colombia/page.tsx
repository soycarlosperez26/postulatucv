import { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Formato ATS para hoja de vida en Colombia",
  description:
    "Cómo armar una HV en Colombia que un ATS pueda leer: estructura, PDF, palabras clave y lo que no debes inventar.",
  alternates: {
    canonical:
      "https://www.postulatucv.online/guia/formato-ats-hoja-de-vida-colombia",
  },
  openGraph: {
    title: "Formato ATS para hoja de vida en Colombia",
    description:
      "Cómo armar una HV en Colombia que un ATS pueda leer: estructura, PDF, palabras clave y lo que no debes inventar.",
    url: "https://www.postulatucv.online/guia/formato-ats-hoja-de-vida-colombia",
  },
  twitter: {
    card: "summary_large_image",
    title: "Formato ATS para hoja de vida en Colombia",
    description:
      "Cómo armar una HV en Colombia que un ATS pueda leer: estructura, PDF, palabras clave y lo que no debes inventar.",
  },
};

export default function FormatoAtsColombiaPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-12 sm:px-10 sm:py-16">
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
      </div>
    </article>
  );
}
