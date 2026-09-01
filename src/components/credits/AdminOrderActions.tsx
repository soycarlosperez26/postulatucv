"use client";

import { useActionState } from "react";
import { approveOrder, rejectOrder } from "@/lib/actions/admin";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";

export function AdminOrderActions({ reference }: { reference: string }) {
  const [approveState, approveAction] = useActionState(approveOrder, undefined);
  const [rejectState, rejectAction] = useActionState(rejectOrder, undefined);

  const message = approveState?.ok ?? rejectState?.ok;
  const error = approveState?.error ?? rejectState?.error;

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <form action={rejectAction}>
          <input type="hidden" name="reference" value={reference} />
          <SubmitButton pendingLabel="…" variant="ghost">
            Descartar
          </SubmitButton>
        </form>
        <form action={approveAction}>
          <input type="hidden" name="reference" value={reference} />
          <SubmitButton pendingLabel="Acreditando…">
            Acreditar créditos
          </SubmitButton>
        </form>
      </div>
      {message && (
        <p className="text-[12.5px] font-semibold text-brand">{message}</p>
      )}
      <FormError message={error} />
    </div>
  );
}
