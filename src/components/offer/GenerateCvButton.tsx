"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { generateCustomCvAction } from "@/lib/actions/cv";
import { buttonClass, ButtonLink, type ButtonVariant } from "@/components/ui/Button";
import { FormError } from "@/components/FormError";
import { SparkIcon } from "@/components/ui/Icons";

function Submit({
  label,
  variant,
}: {
  label: string;
  variant: ButtonVariant;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonClass(variant, "md")}
    >
      <SparkIcon className="h-[17px] w-[17px]" />
      {pending ? "Generando CV…" : label}
    </button>
  );
}

export function GenerateCvButton({
  jobOfferId,
  hasCv,
  balance,
  variant = "primary",
}: {
  jobOfferId: string;
  hasCv: boolean;
  /** Saldo total. `null` cuando no se pudo leer. */
  balance: number | null;
  variant?: ButtonVariant;
}) {
  const [state, formAction] = useActionState(generateCustomCvAction, undefined);

  // Sin saldo: si YA tiene un CV, ofrece comprar (ya usó el crédito).
  // Si NO tiene CV, deja generar (el welcome credit protege el primer análisis).
  if (balance === 0 && hasCv) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        <ButtonLink href="/dashboard/creditos" variant={variant}>
          <SparkIcon className="h-[17px] w-[17px]" />
          Recargar créditos
        </ButtonLink>
        <p className="text-[12.5px] text-muted">
          Te quedaste sin créditos este mes.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <form action={formAction}>
        <input type="hidden" name="jobOfferId" value={jobOfferId} />
        <Submit
          label={hasCv ? "Regenerar CV · 1 crédito" : "Generar CV a medida"}
          variant={variant}
        />
      </form>
      <FormError message={state?.error} />
      {state?.needsCredits && (
        <Link
          href="/dashboard/creditos"
          className="text-[12.5px] font-semibold text-brand hover:text-rust"
        >
          Recargar créditos
        </Link>
      )}
    </div>
  );
}
