import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { profileStats } from "@/lib/profileStats";
import {
  CREDIT_PACK_COP,
  FREE_MONTHLY_CREDITS,
  PLAN_LABEL,
  PRO_MONTHLY_COP,
} from "@/lib/plan";
import { Card, CardTitle, Eyebrow } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Meter } from "@/components/ui/Meter";
import { CheckIcon, PencilIcon, PlusIcon, UploadIcon } from "@/components/ui/Icons";
import { OffersList, type OfferRow } from "@/components/dashboard/OffersList";

function firstDayOfMonthISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: baseProfile } = await supabase
    .from("base_profiles")
    .select("id, full_name, original_file_name, parsed, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!baseProfile) {
    redirect("/onboarding");
  }

  const [{ data: offers }, { data: tailored }, { count: usedThisMonth }] =
    await Promise.all([
      supabase
        .from("job_offers")
        .select("id, company, title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("tailored_cvs")
        .select("job_offer_id, match_score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("tailored_cvs")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", firstDayOfMonthISO()),
    ]);

  // El score de cada oferta es el de su CV adaptado más reciente.
  const latestScore = new Map<string, number>();
  for (const row of tailored ?? []) {
    if (!latestScore.has(row.job_offer_id)) {
      latestScore.set(row.job_offer_id, Number(row.match_score));
    }
  }

  const rows: OfferRow[] = (offers ?? []).map((o) => ({
    id: o.id,
    company: o.company,
    title: o.title,
    score: latestScore.get(o.id) ?? null,
    dateLabel: new Date(o.created_at).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
    }),
  }));

  const stats = profileStats(baseProfile.parsed);
  const listas = rows.filter((r) => r.score !== null).length;
  const used = usedThisMonth ?? 0;
  const remaining = Math.max(0, FREE_MONTHLY_CREDITS - used);
  const displayName = baseProfile.full_name?.trim() || "tu perfil";
  const firstName = displayName.split(" ")[0];

  return (
    <>
      <header className="flex items-center justify-between gap-6 border-b border-line bg-surface px-8 py-[18px]">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[23px] font-bold tracking-[-0.02em] text-ink">
            Hola, {firstName}
          </h1>
          <p className="text-[13.5px] text-muted">
            {listas === 0
              ? "Agrega una oferta para generar tu primer CV a medida."
              : listas === 1
                ? "Tienes 1 CV adaptado listo para enviar."
                : `Tienes ${listas} CV adaptados listos para enviar.`}
          </p>
        </div>
        <ButtonLink href="/dashboard/offers/new">
          <PlusIcon className="h-[17px] w-[17px]" />
          Analizar oferta
        </ButtonLink>
      </header>

      <div className="flex flex-col gap-6 px-8 py-7">
        <div className="grid grid-cols-1 gap-[22px] xl:grid-cols-[minmax(0,1fr)_356px]">
          {/* ---------- CV MAESTRO ---------- */}
          <Card className="flex flex-col gap-4 px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <Eyebrow className="text-rust">Tu CV Maestro</Eyebrow>
                <h2 className="font-display text-[19px] font-bold tracking-[-0.015em] text-ink">
                  {displayName}
                </h2>
                <p className="text-[13px] text-muted">
                  {baseProfile.original_file_name} · actualizado el{" "}
                  {new Date(baseProfile.updated_at).toLocaleDateString("es-CO", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-brand-tint px-3 py-1.5 text-xs font-semibold text-brand">
                <CheckIcon className="h-3.5 w-3.5" />
                Fuente única
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] font-semibold text-ink-soft">
                  Completitud del perfil
                </span>
                <span className="font-display text-[15px] font-bold text-brand">
                  {stats.completeness}%
                </span>
              </div>
              <Meter value={stats.completeness} />
              <p className="text-[12.5px] text-muted">
                {stats.gaps.length === 0
                  ? "Tu perfil está completo."
                  : `Falta ${stats.gaps.slice(0, 2).join(" y ")}.`}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { n: stats.experiences, label: "Experiencias" },
                { n: stats.skills, label: "Habilidades" },
                { n: stats.education, label: "Estudios" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex flex-col gap-0.5 rounded-[10px] border border-paper-line bg-canvas px-3 py-2.5"
                >
                  <span className="font-display text-[19px] font-bold text-ink">
                    {s.n}
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-soft">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <ButtonLink href="/dashboard/cv" variant="outline" size="sm">
                <PencilIcon className="h-4 w-4" />
                Ver mi CV Maestro
              </ButtonLink>
              <ButtonLink href="/onboarding" variant="outline" size="sm">
                <UploadIcon className="h-4 w-4" />
                Reemplazar PDF
              </ButtonLink>
              <p className="ml-auto max-w-[260px] text-right text-[12.5px] text-muted-soft text-pretty">
                Nunca se modifica solo. Cada oferta genera una versión aparte.
              </p>
            </div>
          </Card>

          {/* ---------- CRÉDITOS ---------- */}
          <Card className="flex flex-col overflow-hidden p-0">
            <div className="flex items-center justify-between bg-amber-tint px-5 py-3">
              <Eyebrow className="text-amber-ink">Créditos</Eyebrow>
              <span className="rounded-full bg-surface px-2.5 py-1 text-[11.5px] font-bold text-amber-ink">
                {PLAN_LABEL}
              </span>
            </div>
            <div className="flex flex-col gap-3.5 px-5 pb-5 pt-4">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[40px] font-bold leading-none tracking-[-0.03em] text-ink">
                  {remaining}
                </span>
                <span className="text-sm text-muted">
                  de {FREE_MONTHLY_CREDITS} este mes
                </span>
              </div>
              <Meter value={(remaining / FREE_MONTHLY_CREDITS) * 100} barClass="bg-amber" />
              <p className="text-[12.5px] text-muted text-pretty">
                Cada CV adaptado que generas consume 1 crédito. Llevas {used}{" "}
                {used === 1 ? "generación" : "generaciones"} este mes.
              </p>
              <ButtonLink href="/dashboard/ajustes" className="w-full">
                Pasar a Pro · {PRO_MONTHLY_COP}
              </ButtonLink>
              <p className="text-center text-[13px]">
                <Link
                  href="/dashboard/ajustes"
                  className="font-semibold text-brand hover:text-rust"
                >
                  o comprar {CREDIT_PACK_COP}
                </Link>
              </p>
            </div>
          </Card>
        </div>

        {rows.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <CardTitle>Todavía no has guardado ninguna oferta</CardTitle>
            <p className="max-w-md text-sm text-muted text-pretty">
              Pega la descripción de una vacante y Postula te dice qué tan
              compatible eres, qué palabras clave te faltan y te arma una
              versión de tu CV para esa oportunidad.
            </p>
            <ButtonLink href="/dashboard/offers/new" className="mt-1">
              <PlusIcon className="h-[17px] w-[17px]" />
              Analizar mi primera oferta
            </ButtonLink>
          </Card>
        ) : (
          <OffersList offers={rows} />
        )}
      </div>
    </>
  );
}
