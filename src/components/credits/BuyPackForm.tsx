"use client";

import { useActionState } from "react";
import { buyCredits } from "@/lib/actions/credits";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import type { ButtonVariant } from "@/components/ui/Button";

/**
 * DORMIDO: la interfaz usa RequestPackForm (recarga por WhatsApp).
 * Este componente y `buyCredits` se conservan para reactivar el cobro
 * automático por Wompi cambiando el formulario de la página de créditos.
 */
export function BuyPackForm({
  packId,
  label,
  variant = "primary",
}: {
  packId: string;
  label: string;
  variant?: ButtonVariant;
}) {
  const [state, formAction] = useActionState(buyCredits, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="packId" value={packId} />
      <SubmitButton
        pendingLabel="Abriendo el pago…"
        variant={variant}
        className="w-full"
      >
        {label}
      </SubmitButton>
      <FormError message={state?.error} />
    </form>
  );
}
