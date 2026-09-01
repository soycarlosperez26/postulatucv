import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBalance } from "@/lib/credits";
import { FREE_MONTHLY_CREDITS } from "@/lib/plan";
import { Card, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";

export default async function AjustesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const balance = await getBalance();

  return (
    <>
      <header className="border-b border-line bg-surface px-8 py-[18px]">
        <h1 className="font-display text-[23px] font-bold tracking-[-0.02em] text-ink">
          Ajustes
        </h1>
        <p className="text-[13.5px] text-muted">Tu cuenta y tu saldo.</p>
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Créditos</CardTitle>
            {balance !== null && (
              <span className="rounded-full bg-amber-tint px-2.5 py-1 text-[11.5px] font-bold text-amber-ink">
                {balance.total}{" "}
                {balance.total === 1 ? "disponible" : "disponibles"}
              </span>
            )}
          </div>

          <ul className="flex flex-col gap-2.5">
            {[
              `Recibes ${FREE_MONTHLY_CREDITS} crédito gratis cada mes; no se acumula.`,
              "Los créditos que compras no vencen.",
              "Se gasta primero el gratuito, que es el que se vence.",
              "Si la generación falla, el crédito se te devuelve.",
            ].map((f) => (
              <li key={f} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-tint">
                  <CheckIcon className="h-3 w-3 text-brand" />
                </span>
                <span className="text-[13.5px] text-ink-soft text-pretty">
                  {f}
                </span>
              </li>
            ))}
          </ul>

          <div>
            <ButtonLink href="/dashboard/creditos">
              Ver paquetes y movimientos
            </ButtonLink>
          </div>
        </Card>
      </div>
    </>
  );
}
