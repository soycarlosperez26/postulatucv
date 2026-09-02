"use client";

import { useActionState } from "react";
import { requestCredits } from "@/lib/actions/credits";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { trackBeginCheckout } from "@/lib/analytics";
import type { ButtonVariant } from "@/components/ui/Button";

const PACK_AMOUNTS: Record<string, { pack: "credits_5" | "credits_15" | "credits_50"; value: number }> = {
  p5: { pack: "credits_5", value: 10000 },
  p15: { pack: "credits_15", value: 20000 },
  p50: { pack: "credits_50", value: 50000 },
};

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
    <form
      action={formAction}
      className="flex flex-col gap-2"
      onSubmit={() => {
        const packInfo = PACK_AMOUNTS[packId];
        if (packInfo) {
          trackBeginCheckout(packInfo.pack, packInfo.value);
        }
      }}
    >
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
