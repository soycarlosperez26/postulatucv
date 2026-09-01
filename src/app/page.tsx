import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { CheckIcon } from "@/components/ui/Icons";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-4 px-6 py-5 sm:px-10">
        <Logo wordClassName="text-ink" />
        <div className="flex items-center gap-2.5">
          <ButtonLink href="/login" variant="ghost" size="sm">
            Iniciar sesión
          </ButtonLink>
          <ButtonLink href="/register" size="sm">
            Crear cuenta
          </ButtonLink>
        </div>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center gap-9 px-6 pb-20 text-center">
        <div className="flex max-w-2xl flex-col gap-5">
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-bold leading-[1.08] tracking-[-0.03em] text-ink text-pretty">
            Tu CV. Cada oportunidad.
            <br />
            Una mejor postulación.
          </h1>
          <p className="text-lg leading-[1.6] text-muted text-pretty">
            Sube tu hoja de vida una vez. Para cada oferta, Postula calcula qué
            tan compatible eres con el filtro ATS, te muestra las palabras clave
            que te faltan y arma una versión enfocada en esa vacante.
          </p>
        </div>

        <ButtonLink href="/register" className="h-12 px-7 text-[15px]">
          Empezar gratis
        </ButtonLink>

        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5">
          {[
            "Tu CV original nunca se modifica",
            "Score ATS calculado, no opinado",
            "Hecho para Colombia",
          ].map((t) => (
            <li key={t} className="flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-brand" />
              <span className="text-[13.5px] font-medium text-ink-soft">
                {t}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
