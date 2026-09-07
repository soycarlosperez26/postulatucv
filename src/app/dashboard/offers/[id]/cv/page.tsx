import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBalance } from "@/lib/credits";
import { scoreBand } from "@/lib/score";
import { Card, CardTitle } from "@/components/ui/Card";
import { ChevronRightIcon, InfoIcon } from "@/components/ui/Icons";
import { CvViewer } from "@/components/cv/CvViewer";
import { GenerateCvButton } from "@/components/offer/GenerateCvButton";

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  });
}

export default async function TailoredCvPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: offer }, { data: profile }, { data: rows }, creditBalance] =
    await Promise.all([
    supabase
      .from("job_offers")
      .select("id, company, title")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("base_profiles")
      .select("parsed")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("tailored_cvs")
      .select("id, content, match_score, matched_keywords, created_at")
      .eq("job_offer_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
      getBalance(),
    ]);

  if (!offer) {
    notFound();
  }

  const latest = rows?.[0];
  if (!latest || !profile) {
    redirect(`/dashboard/offers/${id}`);
  }

  const balance = creditBalance?.total ?? null;
  const score = Number(latest.match_score);
  const band = scoreBand(score);
  const total = rows?.length ?? 1;

  return (
    <>
      <header className="flex flex-col gap-3.5 border-b border-line bg-surface px-8 pb-[18px] pt-4">
        <nav className="flex items-center gap-1.5 text-[12.5px]">
          <Link
            href="/dashboard/offers"
            className="font-medium text-muted-soft hover:text-ink"
          >
            Ofertas
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5 text-line-strong" />
          <Link
            href={`/dashboard/offers/${offer.id}`}
            className="font-medium text-muted-soft hover:text-ink"
          >
            {offer.title} · {offer.company}
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5 text-line-strong" />
          <span className="font-semibold text-ink-soft">CV adaptado</span>
        </nav>

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-[23px] font-bold tracking-[-0.02em] text-ink">
              CV adaptado a esta oferta
            </h1>
            <p className="text-[13px] text-muted">
              Versión {total} · generada el {shortDate(latest.created_at)} ·{" "}
              <span className={`font-semibold ${band.text}`}>
                match ATS {band.label}
              </span>
            </p>
          </div>
          <GenerateCvButton
            jobOfferId={offer.id}
            hasCv
            balance={balance}
            variant="outline"
          />
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 px-8 py-7 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex justify-center">
          <div className="w-full max-w-[740px]">
            <CvViewer
              tailored={latest.content}
              base={profile.parsed}
              matchedKeywords={latest.matched_keywords}
            />
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3.5 px-5 py-4">
            <CardTitle className="text-[15px]">Cómo se armó</CardTitle>
            <ul className="flex flex-col gap-2.5">
              {[
                "El perfil profesional se reescribió alrededor de las palabras clave que más pesan en esta oferta.",
                "Las habilidades que la oferta pide se movieron al frente, para que el ATS las lea primero.",
                "Los logros se reformularon con el vocabulario de la oferta, usando lo que ya estaba en tu CV Maestro.",
              ].map((t, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-lg bg-amber-tint font-display text-[13px] font-bold text-amber-ink">
                    {i + 1}
                  </span>
                  <p className="text-[13px] leading-[1.55] text-ink-soft text-pretty">
                    {t}
                  </p>
                </li>
              ))}
            </ul>
            <div className="h-px bg-line-soft" />
            <div className="flex items-start gap-2.5">
              <InfoIcon className="mt-px h-4 w-4 shrink-0 text-brand" />
              <p className="text-[12.5px] leading-[1.55] text-muted text-pretty">
                Ninguna experiencia nueva fue inventada. Compara con tu CV
                Maestro usando el interruptor de arriba.
              </p>
            </div>
          </Card>

          {total > 1 && (
            <Card className="flex flex-col gap-3 px-5 py-4">
              <CardTitle className="text-[15px]">Versiones</CardTitle>
              <div className="flex flex-col gap-2">
                {(rows ?? []).map((row, i) => {
                  const b = scoreBand(Number(row.match_score));
                  const actual = i === 0;
                  return (
                    <div
                      key={row.id}
                      className={`flex items-center gap-3 rounded-[10px] border px-3 py-2.5 ${
                        actual
                          ? "border-brand-line bg-brand-tint"
                          : "border-paper-line"
                      }`}
                    >
                      <span className="flex flex-1 flex-col gap-px">
                        <span
                          className={`text-[13.5px] font-semibold ${
                            actual ? "text-brand" : "text-ink-soft"
                          }`}
                        >
                          Versión {total - i}
                          {actual ? " · actual" : ""}
                        </span>
                        <span
                          className={`text-xs ${
                            actual ? "text-brand-ink" : "text-muted-soft"
                          }`}
                        >
                          {shortDate(row.created_at)} · match {b.label}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[12px] text-muted-soft text-pretty">
                Se muestra siempre la más reciente. Abrir versiones anteriores
                todavía no está implementado.
              </p>
            </Card>
          )}

          <Card className="flex flex-col gap-3 px-5 py-4">
            <CardTitle className="text-[15px]">Exportar</CardTitle>
            <a
              href={`/api/cv/${offer.id}/download`}
              download
              className="flex h-10 items-center justify-center gap-2 rounded-control border border-brand bg-brand px-4 text-[14px] font-semibold text-paper transition hover:brightness-95"
            >
              Descargar PDF
            </a>
            <p className="text-[12.5px] leading-[1.55] text-muted text-pretty">
              Descarga tu CV adaptado como PDF con texto seleccionable,
              compatible con sistemas ATS.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
