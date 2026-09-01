import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatCop } from "@/lib/plan";
import { Card, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { CheckIcon, CloseIcon, InfoIcon } from "@/components/ui/Icons";

/**
 * Página a la que Wompi devuelve al usuario tras pagar.
 *
 * Solo LEE el estado de la orden. Los créditos los acredita el webhook
 * verificado: esta URL la puede abrir cualquiera con la referencia, así
 * que nada de lo que pase aquí toca el saldo.
 */
export default async function ResultadoPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (!ref) {
    redirect("/dashboard/creditos");
  }

  const { data: order } = await supabase
    .from("credit_orders")
    .select("credits, amount_cop, status, created_at")
    .eq("reference", ref)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) {
    redirect("/dashboard/creditos");
  }

  const vistas: Record<
    string,
    { titulo: string; detalle: string; tono: "ok" | "espera" | "falla" }
  > = {
    approved: {
      titulo: "¡Listo! Tus créditos ya están disponibles",
      detalle: `Sumamos ${order.credits} créditos a tu cuenta por ${formatCop(order.amount_cop)}.`,
      tono: "ok",
    },
    pending: {
      titulo: "Estamos confirmando tu pago",
      detalle:
        "Wompi todavía no nos confirma la transacción. Suele tardar unos segundos; si pagaste por PSE o en efectivo puede tomar más. Puedes recargar esta página.",
      tono: "espera",
    },
    declined: {
      titulo: "El pago fue rechazado",
      detalle:
        "No se te cobró nada. Puedes intentarlo de nuevo con otro medio de pago.",
      tono: "falla",
    },
    voided: {
      titulo: "El pago se anuló",
      detalle: "No se te cobró nada. Puedes intentarlo de nuevo.",
      tono: "falla",
    },
    error: {
      titulo: "Hubo un problema con el pago",
      detalle:
        "No pudimos completar la transacción. Si ves un cobro en tu banco, escríbenos con la referencia.",
      tono: "falla",
    },
  };

  const vista = vistas[order.status] ?? vistas.pending;

  return (
    <div className="flex flex-1 items-center justify-center px-8 py-14">
      <Card className="flex w-full max-w-lg flex-col items-center gap-4 px-8 py-10 text-center">
        <span
          className={`flex h-14 w-14 items-center justify-center rounded-full ${
            vista.tono === "ok"
              ? "bg-brand-tint text-brand"
              : vista.tono === "espera"
                ? "bg-amber-tint text-amber-ink"
                : "bg-clay-tint text-clay"
          }`}
        >
          {vista.tono === "ok" ? (
            <CheckIcon className="h-7 w-7" />
          ) : vista.tono === "espera" ? (
            <InfoIcon className="h-7 w-7" />
          ) : (
            <CloseIcon className="h-7 w-7" />
          )}
        </span>

        <CardTitle className="text-[19px]">{vista.titulo}</CardTitle>
        <p className="max-w-sm text-sm text-muted text-pretty">{vista.detalle}</p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
          {vista.tono === "ok" ? (
            <ButtonLink href="/dashboard">Volver al panel</ButtonLink>
          ) : (
            <ButtonLink href="/dashboard/creditos">
              {vista.tono === "espera" ? "Ver mis créditos" : "Intentar de nuevo"}
            </ButtonLink>
          )}
        </div>

        <p className="text-[11.5px] text-faint">Referencia: {ref}</p>
      </Card>
    </div>
  );
}
