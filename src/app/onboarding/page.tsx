"use client";

import { useActionState } from "react";
import { uploadCv } from "@/lib/actions/profile";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { AuthShell } from "@/components/auth/AuthShell";
import { Field } from "@/components/ui/Field";
import { CheckIcon } from "@/components/ui/Icons";

export default function OnboardingPage() {
  const [state, formAction] = useActionState(uploadCv, undefined);

  return (
    <AuthShell
      title="Sube tu CV Maestro"
      subtitle="Lo leemos una sola vez y lo usamos como fuente para todas tus postulaciones."
    >
      <form action={formAction} className="flex flex-col gap-5">
        <FormError message={state?.error} />

        <Field
          id="cv"
          label="Tu hoja de vida en PDF"
          hint="Extraemos el texto y lo estructuramos en experiencias, habilidades y formación."
        >
          <input
            id="cv"
            name="cv"
            type="file"
            accept="application/pdf"
            required
            className="w-full min-w-0 cursor-pointer rounded-control border border-dashed border-line-strong bg-canvas px-3 py-3 text-sm text-ink-soft file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-surface"
          />
        </Field>

        <ul className="flex flex-col gap-2">
          {[
            "Tu CV original nunca se modifica.",
            "Cada oferta genera una versión aparte.",
            "Puedes reemplazarlo cuando quieras.",
          ].map((t) => (
            <li key={t} className="flex items-center gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-tint">
                <CheckIcon className="h-3 w-3 text-brand" />
              </span>
              <span className="text-[13px] text-ink-soft">{t}</span>
            </li>
          ))}
        </ul>

        <SubmitButton pendingLabel="Leyendo tu CV…" className="w-full">
          Continuar
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
