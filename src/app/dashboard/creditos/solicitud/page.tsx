import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatCop } from "@/lib/plan";
import { creditRequestMessage, whatsappLink } from "@/lib/whatsapp";
import { Card, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ChatIcon, CheckIcon, InfoIcon } from "@/components/ui/Icons";

/**
 * Pantalla con el código de la solicitud y el botón de WhatsApp.
 *
 * El enlace se arma en el servidor porque el número vive en
 * WHATSAPP_NUMBER (sin NEXT_PUBLIC_), que no llega al navegador.
 */
export default async function SolicitudPage({
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
    .select("reference, credits, amount_cop, status, created_at")
    .eq("reference", ref)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!order) {
    redirect("/dashboard/creditos");
  }

  const link = whatsappLink(
    creditRequestMessage({
      reference: order.reference,
      credits: order.credits,
      amountLabel: formatCop(order.amount_cop),
    })
  );

  if (order.status === "approved") {
    return (
      <div className="flex flex-1 items-center justify-center px-8 py-14">
        <Card className="flex w-full max-w-lg flex-col items-center gap-4 px-8 py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-tint text-brand">
            <CheckIcon className="h-7 w-7" />
          </span>
          <CardTitle className="text-[19px]">
            Tus {order.credits} créditos ya están acreditados
          </CardTitle>
          <p className="max-w-sm text-sm text-muted text-pretty">
            Gracias. Puedes seguir generando CV a medida cuando quieras.
          </p>
          <div className="mt-2">
            <ButtonLink href="/dashboard">Volver al panel</ButtonLink>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 justify-center px-8 py-12">
      <div className="flex w-full max-w-xl flex-col gap-5">
        <Card className="flex flex-col items-center gap-5 px-8 py-9 text-center">
          <Badge tone="amber">Solicitud abierta</Badge>

          <div className="flex flex-col gap-2">
            <CardTitle className="text-[19px]">
              {order.credits} créditos por {formatCop(order.amount_cop)}
            </CardTitle>
            <p className="text-sm text-muted text-pretty">
              Escríbenos por WhatsApp con este código y coordinamos el pago.
            </p>
          </div>

          <div className="flex flex-col items-center gap-1.5 rounded-card border border-dashed border-line-strong bg-canvas px-8 py-5">
            <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-muted-soft">
              Tu código
            </span>
            <span className="font-display text-[32px] font-bold tracking-[0.02em] text-ink">
              {order.reference}
            </span>
          </div>

          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2.5 rounded-control bg-brand px-7 text-[15px] font-semibold text-surface transition hover:brightness-90"
            >
              <ChatIcon className="h-5 w-5" />
              Escribir por WhatsApp
            </a>
          ) : (
            <div className="flex items-start gap-2.5 rounded-card border border-clay-tint bg-clay-tint px-4 py-3 text-left">
              <InfoIcon className="mt-px h-[17px] w-[17px] shrink-0 text-clay" />
              <p className="text-[12.5px] text-clay text-pretty">
                El número de WhatsApp todavía no está configurado en este
                entorno. Falta definir <code>WHATSAPP_NUMBER</code>.
              </p>
            </div>
          )}

          <p className="text-[12.5px] text-muted-soft text-pretty">
            El mensaje ya va escrito con tu código. Si prefieres, cópialo y
            escríbenos por donde quieras.
          </p>
        </Card>

        <Card className="flex flex-col gap-3 px-6 py-5">
          <CardTitle className="text-[15px]">Qué sigue</CardTitle>
          <ol className="flex flex-col gap-2.5">
            {[
              "Nos escribes con tu código y acordamos el medio de pago.",
              "Confirmas el pago desde tu lado.",
              "Acreditamos los créditos a tu cuenta y te avisamos.",
            ].map((paso, i) => (
              <li key={paso} className="flex gap-2.5">
                <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-line-soft font-display text-[12px] font-bold text-ink-soft">
                  {i + 1}
                </span>
                <span className="text-[13.5px] text-ink-soft text-pretty">
                  {paso}
                </span>
              </li>
            ))}
          </ol>
          <p className="text-[12.5px] text-muted text-pretty">
            Esta pantalla te muestra el estado. Guarda tu código: mientras la
            solicitud siga abierta, la vuelves a encontrar desde la página de
            créditos.
          </p>
        </Card>
      </div>
    </div>
  );
}
