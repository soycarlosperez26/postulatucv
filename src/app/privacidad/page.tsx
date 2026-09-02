import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export const metadata: Metadata = {
  title: "Política de privacidad — Postula",
  description:
    "Cómo tratamos tus datos personales y tu hoja de vida en cumplimiento de la Ley 1581 de 2012.",
  alternates: {
    canonical: "/privacidad",
  },
};

export default function PrivacidadPage() {
  return (
    <main className="flex flex-1 flex-col">
      <PublicHeader />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-6 py-16 sm:py-20">
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.08] tracking-[-0.03em] text-ink">
            Política de privacidad
          </h1>
          <p className="text-[15px] leading-[1.6] text-muted">
            Última actualización: septiembre de 2026
          </p>
        </div>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              1. Responsable del tratamiento
            </h2>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Postula opera en cumplimiento de la Ley 1581 de 2012 de
              protección de datos personales de Colombia. Somos responsables del
              tratamiento de los datos que nos confías al usar nuestra
              plataforma.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              2. Qué datos recolectamos
            </h2>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Recolectamos y almacenamos la siguiente información:
            </p>
            <ul className="flex flex-col gap-2 pl-5 text-[15px] leading-[1.7] text-ink-soft">
              <li className="list-disc">
                <strong>Datos de cuenta:</strong> correo electrónico, nombre (si
                inicias sesión con Google), contraseña cifrada (si usas registro
                por correo).
              </li>
              <li className="list-disc">
                <strong>CV maestro:</strong> el archivo PDF que subes y el texto
                extraído de él.
              </li>
              <li className="list-disc">
                <strong>Ofertas laborales:</strong> el texto de las vacantes que
                pegas.
              </li>
              <li className="list-disc">
                <strong>Resultados del análisis:</strong> scores ATS, palabras
                clave identificadas y CV adaptados que generamos.
              </li>
              <li className="list-disc">
                <strong>Saldo de créditos:</strong> cuántos créditos tienes
                disponibles y el historial de recargas y consumos.
              </li>
              <li className="list-disc">
                <strong>Datos de uso:</strong> si tienes Google Analytics
                habilitado, podemos recolectar información anónima sobre cómo
                usas la plataforma.
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              3. Para qué usamos tus datos
            </h2>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Usamos tus datos exclusivamente para:
            </p>
            <ul className="flex flex-col gap-2 pl-5 text-[15px] leading-[1.7] text-ink-soft">
              <li className="list-disc">
                Proveerte el servicio (analizar ofertas, generar scores ATS,
                adaptar tu CV).
              </li>
              <li className="list-disc">
                Gestionar tu cuenta y tus créditos.
              </li>
              <li className="list-disc">
                Procesar los pagos que coordinas por WhatsApp.
              </li>
              <li className="list-disc">
                Mejorar la plataforma mediante análisis agregado de uso (si
                tienes analytics habilitado).
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              4. Lo que NO hacemos con tus datos
            </h2>
            <ul className="flex flex-col gap-2 pl-5 text-[15px] leading-[1.7] text-ink-soft">
              <li className="list-disc">
                <strong>No vendemos tus CV.</strong> Tu hoja de vida es tuya y
                nunca la compartimos con terceros para fines comerciales.
              </li>
              <li className="list-disc">
                <strong>No entrenamos modelos propios con tus datos.</strong>{" "}
                Como política de producto, no usamos tu CV para entrenar
                nuestros propios modelos de inteligencia artificial.
              </li>
            </ul>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              <strong>Nota importante:</strong> Para analizar tu CV y adaptar
              ofertas, enviamos tu CV y el texto de la oferta a nuestro
              proveedor de inteligencia artificial (DeepSeek). Este envío es
              necesario para proveer el servicio. No controlamos las políticas
              de retención de datos del proveedor de IA.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              5. Autenticación con Google
            </h2>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Si inicias sesión con Google, recibimos tu correo electrónico y
              nombre de perfil. Google nos confirma tu identidad, pero no nos da
              acceso a tu contraseña ni a otros datos de tu cuenta de Google.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              6. Seguridad
            </h2>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Tus datos están almacenados en Supabase, un servicio de base de
              datos con cifrado en tránsito y en reposo. Las contraseñas se
              almacenan cifradas. Aplicamos medidas razonables de seguridad,
              pero ningún sistema es 100% seguro.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              7. Tus derechos
            </h2>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Conforme a la Ley 1581 de 2012, tienes derecho a:
            </p>
            <ul className="flex flex-col gap-2 pl-5 text-[15px] leading-[1.7] text-ink-soft">
              <li className="list-disc">Conocer, actualizar y rectificar tus datos.</li>
              <li className="list-disc">
                Solicitar prueba de tu autorización para el tratamiento.
              </li>
              <li className="list-disc">
                Ser informado sobre el uso que hemos dado a tus datos.
              </li>
              <li className="list-disc">
                Presentar quejas ante la Superintendencia de Industria y
                Comercio por infracciones a la ley.
              </li>
              <li className="list-disc">
                Revocar la autorización y solicitar la supresión de tus datos,
                cuando no haya un deber legal o contractual que impida hacerlo.
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              8. Cómo eliminar tu cuenta
            </h2>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Para eliminar tu cuenta y tus datos, envía un correo desde la
              dirección registrada en tu cuenta a{" "}
              <a
                href="mailto:soycarlosperez26@gmail.com"
                className="font-semibold text-brand hover:underline"
              >
                soycarlosperez26@gmail.com
              </a>{" "}
              solicitando la eliminación. Borraremos tu cuenta, tu CV maestro,
              las ofertas que analizaste y los CV adaptados. Esta acción es
              irreversible.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              9. Cambios a esta política
            </h2>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Podemos actualizar esta política. Cuando hagamos cambios
              importantes, te notificaremos por correo o mediante un aviso en la
              plataforma.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
              10. Contacto
            </h2>
            <p className="text-[15px] leading-[1.7] text-ink-soft text-pretty">
              Si tienes preguntas sobre esta política o quieres ejercer tus
              derechos, escríbenos a{" "}
              <a
                href="mailto:soycarlosperez26@gmail.com"
                className="font-semibold text-brand hover:underline"
              >
                soycarlosperez26@gmail.com
              </a>{" "}
              desde tu correo registrado.
            </p>
          </div>
        </section>
      </div>

      <PublicFooter />
    </main>
  );
}
