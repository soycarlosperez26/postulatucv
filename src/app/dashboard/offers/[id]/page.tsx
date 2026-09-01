import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBalance } from "@/lib/credits";
import { scoreBand, scoreHeadline } from "@/lib/score";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge, KeywordChip } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { ScoreRing } from "@/components/ui/Meter";
import {
  CheckIcon,
  ChevronRightIcon,
  CloseIcon,
  DocIcon,
  ExternalIcon,
  InfoIcon,
  SparkIcon,
} from "@/components/ui/Icons";
import { OfferTabs } from "@/components/offer/OfferTabs";
import { GenerateCvButton } from "@/components/offer/GenerateCvButton";
import type { JobRequirements } from "@/types/domain";

function hostOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function longDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function OfferDetailPage({
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

  const { data: offer } = await supabase
    .from("job_offers")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!offer) {
    notFound();
  }

  const [{ data: tailoredRows }, creditBalance] = await Promise.all([
    supabase
      .from("tailored_cvs")
      .select("match_score, matched_keywords, missing_keywords, created_at")
      .eq("job_offer_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    getBalance(),
  ]);

  const balance = creditBalance?.total ?? null;
  const latest = tailoredRows?.[0] ?? null;
  const versions = tailoredRows?.length ?? 0;
  const score = latest ? Number(latest.match_score) : null;
  const band = scoreBand(score);
  const requirements = (offer.parsed ?? {}) as Partial<JobRequirements>;
  const required = requirements.requiredSkills ?? [];
  const nice = requirements.niceToHaveSkills ?? [];
  const responsibilities = requirements.responsibilities ?? [];
  const missing = latest?.missing_keywords ?? [];
  const matched = latest?.matched_keywords ?? [];
  const host = hostOf(offer.source_url);

  const analisis = latest ? (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col items-start gap-7 px-6 py-6 sm:flex-row sm:items-center">
        <ScoreRing score={score ?? 0} strokeClass={band.stroke} />
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-lg font-bold tracking-[-0.015em] text-ink">
              {scoreHeadline(score ?? 0)}
            </h2>
            <p className="text-[13.5px] text-muted text-pretty">
              Calculado cruzando las palabras clave de esta oferta contra tu CV
              Maestro, igual que un filtro ATS. No es una opinión de la IA.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="brand">{matched.length} palabras clave cubiertas</Badge>
            {missing.length > 0 && (
              <Badge tone="clay">{missing.length} sin cubrir</Badge>
            )}
            <Badge>
              {versions === 1 ? "1 versión generada" : `${versions} versiones generadas`}
            </Badge>
          </div>
        </div>
      </Card>

      {matched.length > 0 && (
        <Card className="flex flex-col gap-3 px-6 py-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <CheckIcon className="h-[18px] w-[18px] text-brand" />
            <CardTitle>Lo que ya cubres</CardTitle>
            <span className="text-[13px] text-muted-soft">
              {matched.length} de {matched.length + missing.length} palabras
              clave de la oferta
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {matched.map((k) => (
              <KeywordChip key={k}>{k}</KeywordChip>
            ))}
          </div>
        </Card>
      )}

      {missing.length > 0 && (
        <Card className="flex flex-col gap-3.5 px-6 py-5">
          <CardTitle>Lo que la oferta pide y no aparece en tu CV</CardTitle>
          <div className="flex flex-col gap-2">
            {missing.map((k) => (
              <div
                key={k}
                className="flex items-center gap-3.5 rounded-[11px] border border-paper-line bg-canvas px-3.5 py-3"
              >
                <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-clay-bar" />
                <span className="flex-1 text-sm font-semibold text-ink">{k}</span>
                <span className="text-[12.5px] text-muted">
                  {required.some(
                    (r) => r.toLowerCase() === k.toLowerCase()
                  )
                    ? "Requisito obligatorio"
                    : "Mencionado en la oferta"}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2.5">
            <InfoIcon className="mt-px h-[17px] w-[17px] shrink-0 text-rust" />
            <p className="text-[12.5px] text-muted text-pretty">
              Postula no inventa experiencia. Si alguna de estas sí la tienes,
              agrégala tú a tu CV Maestro con tus propias palabras y vuelve a
              generar el CV de esta oferta.
            </p>
          </div>
        </Card>
      )}
    </div>
  ) : (
    <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <SparkIcon className="h-6 w-6 text-rust" />
      <CardTitle>Todavía no has analizado esta oferta</CardTitle>
      <p className="max-w-md text-sm text-muted text-pretty">
        Al generar el CV a medida calculamos tu match ATS, te decimos qué
        palabras clave te faltan y creamos una versión de tu CV enfocada en
        esta vacante.
      </p>
      <div className="mt-1">
        <GenerateCvButton
          jobOfferId={offer.id}
          hasCv={false}
          balance={balance}
        />
      </div>
    </Card>
  );

  const requisitos =
    required.length + nice.length + responsibilities.length === 0 ? (
      <Card className="px-6 py-12 text-center text-sm text-muted">
        Los requisitos se extraen de la descripción al generar el primer CV a
        medida.
      </Card>
    ) : (
      <div className="flex flex-col gap-4">
        {required.length > 0 && (
          <Card className="flex flex-col gap-3.5 px-6 py-5">
            <CardTitle>Requisitos obligatorios</CardTitle>
            <div className="flex flex-col gap-2.5">
              {required.map((r, i) => {
                const cubierto = matched.some(
                  (m) => m.toLowerCase() === r.toLowerCase()
                );
                return (
                  <div
                    key={r}
                    className={`flex items-center gap-3 pb-2.5 ${
                      i < required.length - 1 ? "border-b border-line-soft" : ""
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        cubierto ? "bg-brand-tint" : "bg-clay-tint"
                      }`}
                    >
                      {cubierto ? (
                        <CheckIcon className="h-3 w-3 text-brand" />
                      ) : (
                        <CloseIcon className="h-3 w-3 text-clay" />
                      )}
                    </span>
                    <span className="flex-1 text-sm font-medium text-ink">
                      {r}
                    </span>
                    {latest && (
                      <span
                        className={`text-[12.5px] font-semibold ${
                          cubierto ? "text-brand" : "text-clay"
                        }`}
                      >
                        {cubierto ? "En tu CV" : "No aparece"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {nice.length > 0 && (
          <Card className="flex flex-col gap-3 px-6 py-5">
            <CardTitle>Deseables</CardTitle>
            <div className="flex flex-wrap gap-1.5">
              {nice.map((n) => (
                <span
                  key={n}
                  className="rounded-lg border border-paper-line bg-canvas px-2.5 py-1.5 text-[13px] font-medium text-ink-soft"
                >
                  {n}
                </span>
              ))}
            </div>
          </Card>
        )}

        {responsibilities.length > 0 && (
          <Card className="flex flex-col gap-3 px-6 py-5">
            <CardTitle>Responsabilidades del rol</CardTitle>
            <ul className="flex flex-col gap-2">
              {responsibilities.map((r) => (
                <li key={r} className="flex gap-2.5">
                  <span className="text-line-strong">—</span>
                  <span className="text-[13.5px] leading-[1.6] text-ink-soft text-pretty">
                    {r}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    );

  const descripcion = (
    <Card className="flex flex-col gap-3.5 px-7 py-6">
      <p className="text-[12.5px] text-muted-soft">
        Descripción pegada por ti el {longDate(offer.created_at)} ·{" "}
        {offer.raw_description.length.toLocaleString("es-CO")} caracteres
      </p>
      <p className="whitespace-pre-wrap text-sm leading-[1.65] text-ink-soft text-pretty">
        {offer.raw_description}
      </p>
    </Card>
  );

  return (
    <>
      <header className="flex flex-col gap-3.5 border-b border-line bg-surface px-8 pb-5 pt-4">
        <nav className="flex items-center gap-1.5 text-[12.5px]">
          <Link
            href="/dashboard/offers"
            className="font-medium text-muted-soft hover:text-ink"
          >
            Ofertas
          </Link>
          <ChevronRightIcon className="h-3.5 w-3.5 text-line-strong" />
          <span className="font-semibold text-ink-soft">
            {offer.company} · {offer.title}
          </span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-line-soft font-display text-[19px] font-bold text-ink-soft">
              {offer.company.trim().charAt(0).toUpperCase() || "?"}
            </span>
            <div className="flex flex-col gap-2">
              <h1 className="font-display text-2xl font-bold tracking-[-0.02em] text-ink">
                {offer.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{offer.company}</Badge>
                {requirements.seniority && (
                  <Badge>{requirements.seniority}</Badge>
                )}
                {score !== null && (
                  <span
                    className={`font-display text-sm font-bold ${band.text}`}
                  >
                    {band.label} de match
                  </span>
                )}
                <span className="text-[12.5px] text-muted-soft">
                  Guardada el {longDate(offer.created_at)}
                  {host ? ` · enlace de ${host}` : ""}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {offer.source_url && (
              <a
                href={offer.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-control border border-line-strong px-4 text-sm font-semibold text-ink transition hover:bg-line-soft"
              >
                <ExternalIcon className="h-4 w-4" />
                Oferta original
              </a>
            )}
            {latest ? (
              <ButtonLink href={`/dashboard/offers/${offer.id}/cv`}>
                <DocIcon className="h-[17px] w-[17px]" />
                Ver CV adaptado
              </ButtonLink>
            ) : (
              <GenerateCvButton
                jobOfferId={offer.id}
                hasCv={false}
                balance={balance}
              />
            )}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-[22px] px-8 py-6 xl:grid-cols-[minmax(0,1fr)_356px]">
        <OfferTabs
          tabs={[
            { id: "analisis", label: "Análisis ATS", content: analisis },
            { id: "requisitos", label: "Requisitos", content: requisitos },
            {
              id: "descripcion",
              label: "Descripción original",
              content: descripcion,
            },
          ]}
        />

        <aside className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3.5 px-5 py-4">
            <CardTitle className="text-[15px]">Estado de esta oferta</CardTitle>
            <Timeline
              steps={[
                {
                  title: "Oferta guardada",
                  when: longDate(offer.created_at),
                  done: true,
                },
                {
                  title: "Análisis ATS",
                  when: latest
                    ? longDate(latest.created_at)
                    : "Aún sin ejecutar",
                  done: Boolean(latest),
                },
                {
                  title: "CV adaptado generado",
                  when: latest
                    ? versions === 1
                      ? "Versión 1"
                      : `Versión ${versions}, la más reciente`
                    : "Aún sin generar",
                  done: Boolean(latest),
                },
              ]}
            />
            {latest && (
              <GenerateCvButton
                jobOfferId={offer.id}
                hasCv
                balance={balance}
                variant="outline"
              />
            )}
          </Card>

          <Card className="flex flex-col gap-3 px-5 py-4">
            <CardTitle className="text-[15px]">Datos de la oferta</CardTitle>
            <Fact k="Empresa" v={offer.company} />
            {requirements.seniority && (
              <Fact k="Seniority" v={requirements.seniority} />
            )}
            <Fact k="Guardada" v={longDate(offer.created_at)} />
            <Fact k="Origen" v={host ?? "Pegada a mano"} />
          </Card>

          {latest && missing.length > 0 && (
            <section className="flex flex-col gap-2.5 rounded-card bg-forest px-5 py-4">
              <div className="flex items-center gap-2.5">
                <SparkIcon className="h-[18px] w-[18px] text-amber" />
                <h3 className="font-display text-[15px] font-bold text-cream">
                  Antes de enviar
                </h3>
              </div>
              <p className="text-[13px] leading-[1.6] text-forest-ink text-pretty">
                {score !== null && score >= 75
                  ? "Tu match está por encima del corte típico de un ATS (75%)."
                  : "Estás por debajo del corte típico de un ATS (75%)."}{" "}
                Lo que más te suma ahora es cubrir{" "}
                <span className="font-semibold text-cream">{missing[0]}</span>
                {missing.length > 1
                  ? ` y ${missing.length - 1} palabra${
                      missing.length > 2 ? "s" : ""
                    } clave más.`
                  : "."}
              </p>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}

function Fact({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[13px] text-muted-soft">{k}</span>
      <span className="text-right text-[13px] font-semibold text-ink">{v}</span>
    </div>
  );
}

function Timeline({
  steps,
}: {
  steps: Array<{ title: string; when: string; done: boolean }>;
}) {
  return (
    <div className="flex flex-col">
      {steps.map((s, i) => {
        const last = i === steps.length - 1;
        return (
          <div key={s.title} className="flex gap-3">
            <div className="flex w-5 shrink-0 flex-col items-center">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  s.done ? "border-brand-bar bg-brand-bar" : "border-line-strong"
                }`}
              >
                {s.done && <CheckIcon className="h-3 w-3 text-surface" />}
              </span>
              {!last && (
                <span
                  className={`w-0.5 flex-1 ${
                    steps[i + 1].done ? "bg-brand-bar" : "bg-line"
                  } min-h-[22px]`}
                />
              )}
            </div>
            <div className={`flex flex-col ${last ? "" : "pb-3.5"}`}>
              <span
                className={`text-[13.5px] font-semibold ${
                  s.done ? "text-ink" : "text-muted-soft"
                }`}
              >
                {s.title}
              </span>
              <span className="text-xs text-muted-soft">{s.when}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
