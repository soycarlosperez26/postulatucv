"use client";

import { useActionState } from "react";
import { requestCredits } from "@/lib/actions/credits";
import { Card } from "@/components/ui/Card";
import { SparkIcon } from "@/components/ui/Icons";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { trackBeginCheckout } from "@/lib/analytics";

interface ConversionCardProps {
  /** Score anterior (versión previa o maestro) */
  beforeScore?: number;
  /** Score actual/más reciente */
  afterScore: number;
}

export function ConversionCard({ beforeScore, afterScore }: ConversionCardProps) {
  const [state, formAction] = useActionState(requestCredits, undefined);

  let copyText: string;

  if (beforeScore !== undefined) {
    // Hay un score anterior real: comparamos x vs y
    if (afterScore > beforeScore) {
      // JUMP: mejora real (incluso si y < 75)
      copyText = `Tu score en esta vacante pasó de ${beforeScore}% a ${afterScore}%. El original no se tocó. Ya puedes bajar el PDF de esta vacante. La siguiente oferta cuesta 1 crédito. 15 créditos = $20.000. No vencen.`;
    } else {
      // NO-MATCH: y ≤ x (no mejoró o empeoró)
      copyText = `Esta oferta no era match. Ya puedes bajar el PDF de esta vacante. La siguiente sí puede serlo — 1 crédito. Pack 15 / $20.000, no vencen.`;
    }
  } else {
    // Primer análisis (no hay x): usamos threshold 75 solo aquí
    if (afterScore >= 75) {
      // Primer análisis con buen score
      copyText = `Score ${afterScore}%, original no se tocó. Ya puedes bajar el PDF de esta vacante. La siguiente oferta cuesta 1 crédito. Pack 15 / $20.000, no vencen.`;
    } else {
      // NO-MATCH: primer análisis con score bajo
      copyText = `Esta oferta no era match. Ya puedes bajar el PDF de esta vacante. La siguiente sí puede serlo — 1 crédito. Pack 15 / $20.000, no vencen.`;
    }
  }

  return (
    <Card className="flex flex-col gap-4 border-brand-line bg-brand-tint px-6 py-5">
      <div className="flex items-start gap-3">
        <SparkIcon className="mt-0.5 h-5 w-5 shrink-0 text-amber" />
        <div className="flex flex-1 flex-col gap-3">
          <p className="text-[14px] font-medium leading-[1.55] text-brand-ink text-pretty">
            {copyText}
          </p>
          <form
            action={formAction}
            onSubmit={() => {
              trackBeginCheckout("credits_15", 20000);
            }}
          >
            <input type="hidden" name="packId" value="p15" />
            <SubmitButton
              pendingLabel="Generando tu código…"
              variant="primary"
              className="w-full sm:w-auto"
            >
              Pedir 15 créditos por WhatsApp
            </SubmitButton>
          </form>
          <FormError message={state?.error} />
        </div>
      </div>
    </Card>
  );
}
