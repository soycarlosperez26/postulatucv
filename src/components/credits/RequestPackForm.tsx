"use client";

import { useActionState } from "react";
import { requestCredits } from "@/lib/actions/credits";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import type { ButtonVariant } from "@/components/ui/Button";

export function RequestPackForm({
  packId,
  label,
  variant = "primary",
}: {
  packId: string;
  label: string;
  variant?: ButtonVariant;
}) {
  const [state, formAction] = useActionState(requestCredits, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="packId" value={packId} />
      <SubmitButton
        pendingLabel="Generando tu código…"
        variant={variant}
        className="w-full"
      >
        {label}
      </SubmitButton>
      <FormError message={state?.error} />
    </form>
  );
}
