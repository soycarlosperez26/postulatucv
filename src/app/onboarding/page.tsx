"use client";

import { useActionState, useState } from "react";
import { uploadCv } from "@/lib/actions/profile";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { AuthShell } from "@/components/auth/AuthShell";
import { Field } from "@/components/ui/Field";
import { CheckIcon } from "@/components/ui/Icons";
import { MAX_CV_SIZE_BYTES } from "@/lib/fileUtils";

export default function OnboardingPage() {
  const [state, formAction] = useActionState(uploadCv, undefined);
  const [clientError, setClientError] = useState<string | undefined>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientError(undefined);
    const file = e.target.files?.[0];
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setClientError("Por ahora solo se aceptan archivos PDF.");
      setSelectedFile(null);
      e.target.value = "";
      return;
    }

    if (file.size > MAX_CV_SIZE_BYTES) {
      const maxSizeMB = Math.floor(MAX_CV_SIZE_BYTES / (1024 * 1024));
      setClientError(`El archivo es muy grande. El tamaño máximo es ${maxSizeMB} MB.`);
      setSelectedFile(null);
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  return (
    <AuthShell
      title="Sube tu CV Maestro"
      subtitle="Lo leemos una sola vez y lo usamos como fuente para todas tus postulaciones."
    >
      <form action={formAction} className="flex flex-col gap-5">
        <FormError message={clientError || state?.error} />

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
            onChange={handleFileChange}
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
