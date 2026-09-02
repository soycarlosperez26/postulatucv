import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Términos y condiciones — Postula",
  description:
    "Condiciones de uso de Postula. Lee los términos antes de usar la plataforma.",
  alternates: {
    canonical: "/terminos",
  },
};

export default function TerminosPage() {
  return (
    <main className="flex flex-1 flex-col">
      <PublicHeader />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16 sm:py-20">
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.08] tracking-[-0.03em] text-ink">
            Términos y condiciones
          </h1>
          <p className="text-[15px] leading-[1.6] text-muted">
            Última actualización: septiembre de 2026
          </p>
        </div>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              1. Aceptación de los términos
            </h2>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Al crear una cuenta en Postula, aceptas estos términos y
              condiciones. Si no estás de acuerdo, no uses la plataforma.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              2. Qué hace Postula
            </h2>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Postula es una herramienta que:
            </p>
            <ul className="flex flex-col gap-2 pl-5 text-[15px] leading-[1.7] text-ink-soft">
              <li className="list-disc">
                Analiza la compatibilidad entre tu CV y una oferta laboral.
              </li>
              <li className="list-disc">
                Calcula un score ATS que estima qué tan bien tu CV cumple con
                los requisitos de la vacante.
              </li>
              <li className="list-disc">
                Adapta tu CV maestro a cada oferta, reordenando y reescribiendo
                a partir de tu experiencia real.
              </li>
            </ul>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Postula NO inventa experiencia que no tienes. NO modifica tu CV
              maestro. NO garantiza que te contraten.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              3. Tu responsabilidad
            </h2>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Eres responsable de:
            </p>
            <ul className="flex flex-col gap-2 pl-5 text-[15px] leading-[1.7] text-ink-soft">
              <li className="list-disc">
                La veracidad de la información en tu CV. Postula reescribe, pero
                no verifica hechos.
              </li>
              <li className="list-disc">
                Revisar cada CV adaptado antes de enviarlo. El resultado es una
                sugerencia, no un documento listo para enviar sin revisión.
              </li>
              <li className="list-disc">
                El uso que hagas de los CV adaptados. Postula no es responsable
                de consecuencias derivadas de enviar información falsa o
                adaptaciones incorrectas.
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              4. Créditos y pagos
            </h2>
            <ul className="flex flex-col gap-2 pl-5 text-[15px] leading-[1.7] text-ink-soft">
              <li className="list-disc">
                Un crédito equivale a una oferta analizada (score + CV adaptado).
              </li>
              <li className="list-disc">
                Los créditos comprados no vencen.
              </li>
              <li className="list-disc">
                Las recargas se coordinan por WhatsApp. Una vez confirmado el
                pago, los créditos se acreditan en tu cuenta.
              </li>
              <li className="list-disc">
                No hay reembolsos, excepto en caso de error técnico de nuestra
                parte que impida el uso del servicio.
              </li>
              <li className="list-disc">
                No existe un plan Pro ni suscripción mensual. Solo pagas por
                créditos cuando los necesitas.
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              5. Sin garantías de empleo
            </h2>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Postula es una herramienta de optimización de CV. NO garantizamos
              que:
            </p>
            <ul className="flex flex-col gap-2 pl-5 text-[15px] leading-[1.7] text-ink-soft">
              <li className="list-disc">
                Te llamen a entrevista.
              </li>
              <li className="list-disc">
                Consigas el empleo.
              </li>
              <li className="list-disc">
                El sistema ATS de la empresa te apruebe. Los ATS varían y
                algunos usan criterios que no podemos predecir.
              </li>
            </ul>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Lo que sí prometemos: que el CV adaptado refleja tu experiencia
              real en el idioma de la vacante.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              6. Uso prohibido
            </h2>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              No puedes usar Postula para:
            </p>
            <ul className="flex flex-col gap-2 pl-5 text-[15px] leading-[1.7] text-ink-soft">
              <li className="list-disc">
                Inventar experiencia laboral que no tienes.
              </li>
              <li className="list-disc">
                Falsificar títulos, certificaciones o cargos.
              </li>
              <li className="list-disc">
                Revender el servicio sin autorización.
              </li>
              <li className="list-disc">
                Intentar acceder a cuentas de otros usuarios o violar la
                seguridad de la plataforma.
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              7. Propiedad intelectual
            </h2>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Tu CV es tuyo. Los CV adaptados que genera Postula también son
              tuyos. Postula, su nombre, logo y diseño son propiedad de sus
              creadores. No puedes copiar ni modificar la plataforma sin
              autorización.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              8. Limitación de responsabilidad
            </h2>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Postula se ofrece &quot;tal cual&quot;. No garantizamos que esté libre de
              errores ni disponible 24/7. No somos responsables de:
            </p>
            <ul className="flex flex-col gap-2 pl-5 text-[15px] leading-[1.7] text-ink-soft">
              <li className="list-disc">
                Pérdida de datos por fallas técnicas.
              </li>
              <li className="list-disc">
                Consecuencias de enviar un CV con errores o información falsa.
              </li>
              <li className="list-disc">
                Daños indirectos derivados del uso de la plataforma.
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              9. Ley aplicable
            </h2>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Estos términos se rigen por las leyes de Colombia. Cualquier
              disputa se resolverá en los tribunales competentes de Colombia.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              10. Modificaciones
            </h2>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Podemos actualizar estos términos en cualquier momento. Te
              notificaremos de cambios importantes por correo o mediante un
              aviso en la plataforma. Si sigues usando Postula después de los
              cambios, aceptas los términos actualizados.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              11. Contacto
            </h2>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Si tienes preguntas sobre estos términos, contáctanos desde tu
              correo registrado.
            </p>
          </div>
        </section>
      </div>

      <PublicFooter />
    </main>
  );
}
