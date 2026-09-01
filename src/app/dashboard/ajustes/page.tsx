import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  CREDIT_PACK_COP,
  FREE_MONTHLY_CREDITS,
  PLAN_LABEL,
  PRO_MONTHLY_COP,
  PRO_YEARLY_COP,
} from "@/lib/plan";
import { Card, CardTitle, Eyebrow } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CheckIcon } from "@/components/ui/Icons";

function firstDayOfMonthISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export default async function AjustesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { count: usedThisMonth } = await supabase
    .from("tailored_cvs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", firstDayOfMonthISO());

  const used = usedThisMonth ?? 0;

  return (
    <>
      <header className="border-b border-line bg-surface px-8 py-[18px]">
        <h1 className="font-display text-[23px] font-bold tracking-[-0.02em] text-ink">
          Ajustes
        </h1>
        <p className="text-[13.5px] text-muted">
          Tu cuenta, tu plan y tu consumo de créditos.
        </p>
      </header>

      <div className="flex max-w-3xl flex-col gap-5 px-8 py-7">
        <Card className="flex flex-col gap-3 px-6 py-5">
          <CardTitle>Cuenta</CardTitle>
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-[13px] text-muted-soft">Correo</span>
            <span className="text-[13px] font-semibold text-ink">
              {user.email}
            </span>
          </div>
        </Card>

        <Card className="flex flex-col gap-4 px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Plan y créditos</CardTitle>
            <span className="rounded-full bg-amber-tint px-2.5 py-1 text-[11.5px] font-bold text-amber-ink">
              {PLAN_LABEL}
            </span>
          </div>
          <p className="text-[13.5px] text-muted text-pretty">
            Llevas <span className="font-semibold text-ink">{used}</span>{" "}
            {used === 1 ? "CV adaptado generado" : "CV adaptados generados"}{" "}
            este mes, de {FREE_MONTHLY_CREDITS} incluidos en el plan gratuito.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "Pro mensual", price: PRO_MONTHLY_COP },
              { label: "Pro anual", price: PRO_YEARLY_COP },
              { label: "Paquete de créditos", price: CREDIT_PACK_COP },
            ].map((p) => (
              <div
                key={p.label}
                className="flex flex-col gap-1 rounded-[10px] border border-paper-line bg-canvas px-4 py-3"
              >
                <Eyebrow className="text-muted-soft">{p.label}</Eyebrow>
                <span className="font-display text-[17px] font-bold text-ink">
                  {p.price}
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-[11px] border border-line bg-canvas px-4 py-3">
            <Badge tone="amber">Pendiente</Badge>
            <p className="flex-1 text-[12.5px] text-muted text-pretty">
              La pasarela de pagos todavía no está conectada, y el consumo de
              créditos no se está descontando ni bloqueando: el número de arriba
              cuenta los CV que ya generaste, no un saldo real.
            </p>
          </div>
        </Card>

        <Card className="flex flex-col gap-3 px-6 py-5">
          <CardTitle>Qué incluye Pro</CardTitle>
          <ul className="flex flex-col gap-2.5">
            {[
              "CV adaptados ilimitados",
              "Historial completo de versiones por oferta",
              "Exportación a PDF y DOCX",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-tint">
                  <CheckIcon className="h-3 w-3 text-brand" />
                </span>
                <span className="text-[13.5px] text-ink-soft">{f}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
