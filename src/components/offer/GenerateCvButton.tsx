"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { generateCustomCvAction } from "@/lib/actions/cv";
import { buttonClass, type ButtonVariant } from "@/components/ui/Button";
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
  variant = "primary",
}: {
  jobOfferId: string;
  hasCv: boolean;
  variant?: ButtonVariant;
}) {
  const [state, formAction] = useActionState(generateCustomCvAction, undefined);

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
    </div>
  );
}
