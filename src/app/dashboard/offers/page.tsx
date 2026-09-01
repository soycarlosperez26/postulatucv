import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { PlusIcon } from "@/components/ui/Icons";
import { OffersList, type OfferRow } from "@/components/dashboard/OffersList";

export default async function OffersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: offers }, { data: tailored }] = await Promise.all([
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
  ]);

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

  return (
    <>
      <header className="flex items-center justify-between gap-6 border-b border-line bg-surface px-8 py-[18px]">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[23px] font-bold tracking-[-0.02em] text-ink">
            Ofertas
          </h1>
          <p className="text-[13.5px] text-muted">
            Cada oferta guardada genera su propia versión de tu CV.
          </p>
        </div>
        <ButtonLink href="/dashboard/offers/new">
          <PlusIcon className="h-[17px] w-[17px]" />
          Analizar oferta
        </ButtonLink>
      </header>

      <div className="px-8 py-7">
        {rows.length === 0 ? (
          <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <CardTitle>Todavía no has guardado ninguna oferta</CardTitle>
            <p className="max-w-md text-sm text-muted text-pretty">
              Pega la descripción de una vacante y Postula calcula tu
              compatibilidad con el filtro ATS.
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
