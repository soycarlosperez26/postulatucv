import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { profileStats } from "@/lib/profileStats";
import { Card, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { Meter } from "@/components/ui/Meter";
import { CheckIcon, InfoIcon, UploadIcon } from "@/components/ui/Icons";
import { CvDocument } from "@/components/cv/CvDocument";

export default async function MasterCvPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("base_profiles")
    .select("full_name, original_file_name, parsed, updated_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/onboarding");
  }

  const stats = profileStats(profile.parsed);

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-6 border-b border-line bg-surface px-8 py-[18px]">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[23px] font-bold tracking-[-0.02em] text-ink">
            Tu CV Maestro
          </h1>
          <p className="text-[13.5px] text-muted">
            {profile.original_file_name} · actualizado el{" "}
            {new Date(profile.updated_at).toLocaleDateString("es-CO", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <ButtonLink href="/onboarding" variant="outline">
          <UploadIcon className="h-4 w-4" />
          Reemplazar PDF
        </ButtonLink>
      </header>

      <div className="grid grid-cols-1 items-start gap-6 px-8 py-7 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex justify-center">
          <CvDocument data={profile.parsed} className="max-w-[740px]" />
        </div>

        <aside className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3.5 px-5 py-4">
            <div className="flex items-baseline justify-between">
              <CardTitle className="text-[15px]">Completitud</CardTitle>
              <span className="font-display text-[15px] font-bold text-brand">
                {stats.completeness}%
              </span>
            </div>
            <Meter value={stats.completeness} />
            {stats.gaps.length === 0 ? (
              <p className="flex items-center gap-2 text-[13px] font-semibold text-brand">
                <CheckIcon className="h-4 w-4" />
                Tu perfil está completo.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {stats.gaps.map((g) => (
                  <li
                    key={g}
                    className="flex gap-2.5 text-[13px] text-ink-soft"
                  >
                    <span className="mt-[7px] h-[6px] w-[6px] shrink-0 rounded-full bg-clay-bar" />
                    <span className="first-letter:uppercase">Falta {g}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="flex flex-col gap-3 px-5 py-4">
            <CardTitle className="text-[15px]">En números</CardTitle>
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
          </Card>

          <Card className="flex items-start gap-2.5 px-5 py-4">
            <InfoIcon className="mt-px h-4 w-4 shrink-0 text-rust" />
            <p className="text-[12.5px] leading-[1.55] text-muted text-pretty">
              Este documento es tu fuente única. Ninguna oferta lo modifica:
              cada una genera una versión aparte. Editarlo campo por campo
              todavía no está implementado — por ahora se actualiza subiendo un
              PDF nuevo.
            </p>
          </Card>
        </aside>
      </div>
    </>
  );
}
