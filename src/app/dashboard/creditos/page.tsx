import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBalance } from "@/lib/credits";
import {
  FREE_MONTHLY_CREDITS,
  RECOMMENDED_PACK_ID,
  formatCop,
  pricePerCredit,
} from "@/lib/plan";
import { Card, CardTitle, Eyebrow } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ChatIcon, InfoIcon, SparkIcon } from "@/components/ui/Icons";
import { RequestPackForm } from "@/components/credits/RequestPackForm";

const KIND_LABEL: Record<string, string> = {
  free_grant: "Crédito gratis del mes",
  purchase: "Recarga acreditada",
  consume: "CV a medida generado",
  refund: "Devolución por fallo",
};

export default async function CreditosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [balance, { data: packs }, { data: movimientos }, { data: pendientes }] =
    await Promise.all([
      getBalance(),
      supabase
        .from("credit_packs")
        .select("id, credits, amount_cop, label")
        .eq("active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("credit_transactions")
        .select("id, kind, amount, balance_after, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("credit_orders")
        .select("reference, credits, amount_cop")
        .eq("user_id", user.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1),
    ]);

  const pendiente = pendientes?.[0];

  return (
    <>
      <header className="border-b border-line bg-surface px-8 py-[18px]">
        <h1 className="font-display text-[23px] font-bold tracking-[-0.02em] text-ink">
          Créditos
        </h1>
        <p className="text-[13.5px] text-muted">
          Un crédito equivale a un CV adaptado a una oferta.
        </p>
      </header>

      <div className="flex max-w-4xl flex-col gap-5 px-8 py-7">
        {/* saldo */}
        <Card className="flex flex-wrap items-center justify-between gap-5 px-6 py-5">
          {balance === null ? (
            <div className="flex items-start gap-2.5">
              <InfoIcon className="mt-px h-[18px] w-[18px] shrink-0 text-clay" />
              <p className="text-sm text-muted text-pretty">
                No pudimos leer tu saldo en este momento. Recarga la página; si
                sigue igual, puede que falte aplicar la migración de créditos.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-3">
                <span className="font-display text-[44px] font-bold leading-none tracking-[-0.03em] text-ink">
                  {balance.total}
                </span>
                <span className="text-sm text-muted">
                  {balance.total === 1
                    ? "crédito disponible"
                    : "créditos disponibles"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={balance.free > 0 ? "brand" : "neutral"}>
                  {balance.free} gratis este mes
                </Badge>
                <Badge tone={balance.purchased > 0 ? "amber" : "neutral"}>
                  {balance.purchased} recargados
                </Badge>
              </div>
            </>
          )}
        </Card>

        {/* solicitud en curso */}
        {pendiente && (
          <Link
            href={`/dashboard/creditos/solicitud?ref=${pendiente.reference}`}
            className="flex items-center gap-3.5 rounded-card border border-amber-tint bg-amber-tint px-5 py-4 transition hover:brightness-95"
          >
            <ChatIcon className="h-5 w-5 shrink-0 text-amber-ink" />
            <span className="flex-1 text-[13.5px] text-amber-ink text-pretty">
              Tienes una solicitud abierta de {pendiente.credits} créditos por{" "}
              {formatCop(pendiente.amount_cop)}. Código{" "}
              <span className="font-bold">{pendiente.reference}</span>.
            </span>
            <span className="text-[13px] font-bold text-amber-ink">
              Ver instrucciones
            </span>
          </Link>
        )}

        {/* paquetes */}
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-lg font-bold tracking-[-0.015em] text-ink">
              Recargar créditos
            </h2>
            <span className="text-[12.5px] text-muted-soft">
              Pago único · no vencen
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {(packs ?? []).map((pack) => {
              const esRecomendado = pack.id === RECOMMENDED_PACK_ID;
              const esMejorValor = pack.id === "p50";
              let badge: { text: string; tone: "brand" | "amber" } | null = null;
              
              if (esRecomendado) {
                badge = { text: "Mejor para empezar", tone: "brand" };
              } else if (esMejorValor) {
                badge = { text: "Mejor valor", tone: "amber" };
              }

              return (
                <Card
                  key={pack.id}
                  className={`flex flex-col gap-4 px-5 py-5 ${
                    esRecomendado ? "border-brand ring-1 ring-brand" : ""
                  }`}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <Eyebrow className="text-rust">{pack.label}</Eyebrow>
                      {badge && <Badge tone={badge.tone}>{badge.text}</Badge>}
                    </div>
                    <span className="font-display text-[30px] font-bold leading-none tracking-[-0.03em] text-ink">
                      {formatCop(pack.amount_cop)}
                    </span>
                    <span className="text-[12.5px] text-muted">
                      {pricePerCredit(pack.amount_cop, pack.credits)} por crédito
                    </span>
                  </div>

                  <p className="flex items-center gap-2 text-[13px] text-ink-soft">
                    <SparkIcon className="h-4 w-4 shrink-0 text-amber" />
                    {pack.credits} CV a medida
                  </p>

                  <RequestPackForm
                    packId={pack.id}
                    label="Pedir por WhatsApp"
                    variant={esRecomendado ? "primary" : "outline"}
                  />
                </Card>
              );
            })}
          </div>

          <div className="flex items-start gap-2.5 rounded-card border border-line bg-surface px-5 py-4">
            <ChatIcon className="mt-px h-[18px] w-[18px] shrink-0 text-brand" />
            <p className="text-[12.5px] text-muted text-pretty">
              La recarga se coordina por WhatsApp: eliges el paquete, te damos
              un código, nos escribes y acordamos el medio de pago. Apenas se
              confirma, los créditos aparecen en tu cuenta. Tu plan gratuito
              sigue dándote {FREE_MONTHLY_CREDITS} crédito cada mes.
            </p>
          </div>
        </div>

        {/* historial */}
        <Card className="flex flex-col gap-3 px-6 py-5">
          <CardTitle>Movimientos</CardTitle>
          {!movimientos || movimientos.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted">
              Todavía no hay movimientos.
            </p>
          ) : (
            <div className="flex flex-col">
              {movimientos.map((m, i) => (
                <div
                  key={m.id}
                  className={`flex items-center gap-4 py-2.5 ${
                    i < movimientos.length - 1 ? "border-b border-line-soft" : ""
                  }`}
                >
                  <span className="flex-1 text-[13.5px] text-ink">
                    {KIND_LABEL[m.kind] ?? m.kind}
                  </span>
                  <span className="text-[12.5px] text-muted-soft">
                    {new Date(m.created_at).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span
                    className={`w-12 text-right font-display text-sm font-bold ${
                      m.amount > 0 ? "text-brand" : "text-muted"
                    }`}
                  >
                    {m.amount > 0 ? `+${m.amount}` : m.amount}
                  </span>
                  <span className="w-16 text-right text-[12.5px] text-muted-soft">
                    queda {m.balance_after}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
