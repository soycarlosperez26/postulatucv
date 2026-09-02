import type { Metadata } from "next";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { formatCop, pricePerCredit, DISPLAY_CREDIT_PACKS } from "@/lib/plan";

export const metadata: Metadata = {
  title: "Precios — Postula",
  description:
    "Precios simples. Pagas por oferta, no por mes. Un crédito = una oferta analizada.",
  alternates: {
    canonical: "/precios",
  },
};

export default async function PreciosPage() {
  let user = null;
  let packs = null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user: fetchedUser },
    } = await supabase.auth.getUser();
    user = fetchedUser;

    const { data: packsData } = await supabase
      .from("credit_packs")
      .select("id, credits, amount_cop, label")
      .eq("active", true)
      .order("sort_order", { ascending: true });
    packs = packsData;
  }

  const ctaHref = user
    ? "/dashboard/creditos"
    : "/register?returnUrl=/precios";

  const displayPacks =
    packs && packs.length > 0
      ? packs.map((p) => ({
          id: p.id,
          credits: p.credits,
          amountCop: p.amount_cop,
          label: p.label,
        }))
      : DISPLAY_CREDIT_PACKS;

  return (
    <main className="flex flex-1 flex-col">
      <PublicHeader />

      <div className="flex flex-1 flex-col gap-16 px-6 py-16 sm:py-20">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 text-center">
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold leading-[1.08] tracking-[-0.03em] text-ink">
            Precios simples. Pagas por oferta, no por mes.
          </h1>
          <p className="text-lg leading-[1.6] text-muted text-pretty">
            Un crédito = una oferta analizada (score + CV de esa vacante). El CV
            maestro no gasta crédito.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="flex flex-col gap-5 px-6 py-6">
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-muted">
                Gratis
              </span>
              <span className="font-display text-[40px] font-bold leading-none tracking-[-0.03em] text-ink">
                $0
              </span>
              <span className="text-[13.5px] text-muted">1 crédito</span>
            </div>
            <p className="text-[14px] leading-[1.5] text-ink-soft">
              Al crear tu cuenta
            </p>
          </Card>

          {displayPacks.map((pack) => {
            const isRecommended = pack.id === "p15";
            const isBestValue = pack.id === "p50";

            return (
              <Card
                key={pack.id}
                className={`flex flex-col gap-5 px-6 py-6 ${
                  isRecommended ? "border-brand ring-1 ring-brand" : ""
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-rust">
                      {pack.label}
                    </span>
                    {isRecommended && <Badge tone="brand">Mejor para empezar</Badge>}
                    {isBestValue && <Badge tone="neutral">Mejor valor</Badge>}
                  </div>
                  <span className="font-display text-[40px] font-bold leading-none tracking-[-0.03em] text-ink">
                    {formatCop(pack.amountCop)}
                  </span>
                  <span className="text-[13.5px] text-muted">
                    {pricePerCredit(pack.amountCop, pack.credits)} por crédito
                  </span>
                </div>
                <ButtonLink
                  href={ctaHref}
                  variant={isRecommended ? "primary" : "outline"}
                  className="w-full"
                >
                  Comprar
                </ButtonLink>
              </Card>
            );
          })}
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 rounded-card border border-line bg-surface px-6 py-6">
          <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-ink">
            Lo que necesitas saber
          </h2>
          <ul className="flex flex-col gap-3 text-[14.5px] leading-[1.6] text-muted">
            <li className="flex gap-3">
              <span className="shrink-0">•</span>
              <span>
                El crédito de bienvenida se renueva cada mes y no se acumula. Los
                créditos comprados no vencen. No hay suscripción.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0">•</span>
              <span>
                Cada oferta que analices gasta 1 crédito. Subir tu CV maestro no
                gasta crédito.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0">•</span>
              <span>
                La recarga se coordina por WhatsApp: eliges el paquete, te damos
                un código, nos escribes y acordamos el medio de pago.
              </span>
            </li>
          </ul>
        </div>
      </div>

      <PublicFooter />
    </main>
  );
}
