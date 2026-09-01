import type { CvProfile, TailoredCvContent } from "@/types/domain";

export type CvDocumentData = CvProfile | TailoredCvContent;

function dateRange(start?: string, end?: string, current?: boolean) {
  const from = start?.trim();
  const to = current ? "Actualidad" : end?.trim();
  if (from && to) return `${from} — ${to}`;
  return from || to || "";
}

/**
 * La hoja de vida renderizada. Usa una rampa de color propia (papel
 * blanco, tinta casi negra) para que se lea como un documento impreso y
 * no como una tarjeta más de la aplicación.
 */
export function CvDocument({
  data,
  highlightSkills = [],
  className = "",
}: {
  data: CvDocumentData;
  /** Habilidades a resaltar: las que la oferta pedía y el CV ya tenía. */
  highlightSkills?: string[];
  className?: string;
}) {
  const marked = new Set(highlightSkills.map((s) => s.toLowerCase().trim()));
  const languages = "languages" in data ? (data.languages ?? []) : [];
  const certifications =
    "certifications" in data ? (data.certifications ?? []) : [];
  const links = data.contact.links ?? [];

  const contactLine = [data.contact.location, data.contact.phone, data.contact.email]
    .filter(Boolean)
    .concat(links)
    .join(" · ");

  return (
    <article
      className={`flex w-full flex-col gap-5 rounded-md border border-paper-line bg-paper px-12 py-9 shadow-[0_12px_32px_-18px_rgba(32,27,20,0.35)] ${className}`}
    >
      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-[27px] font-bold tracking-[-0.02em] text-paper-ink">
          {data.contact.name || "Sin nombre"}
        </h2>
        {contactLine && (
          <p className="text-[12.5px] text-paper-muted">{contactLine}</p>
        )}
      </div>

      <div className="h-px bg-paper-line" />

      {data.summary && (
        <section className="flex flex-col gap-2">
          <SectionTitle>Perfil profesional</SectionTitle>
          <p className="text-[13.5px] leading-[1.65] text-paper-body text-pretty">
            {data.summary}
          </p>
        </section>
      )}

      {data.experience.length > 0 && (
        <section className="flex flex-col gap-3.5">
          <SectionTitle>Experiencia profesional</SectionTitle>
          {data.experience.map((job, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[14.5px] font-bold text-paper-ink">
                  {job.role}
                </span>
                <span className="whitespace-nowrap text-[12.5px] text-paper-muted">
                  {dateRange(job.startDate, job.endDate, job.current)}
                </span>
              </div>
              <span className="text-[13px] font-medium text-paper-muted">
                {job.company}
              </span>
              {job.achievements.length > 0 && (
                <div className="flex flex-col gap-1.5 pt-0.5">
                  {job.achievements.map((a, j) => (
                    <div key={j} className="flex gap-2.5">
                      <span className="text-[13.5px] leading-[1.6] text-paper-line">
                        —
                      </span>
                      <p className="text-[13.5px] leading-[1.6] text-paper-body text-pretty">
                        {a}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {data.skills.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <SectionTitle>Habilidades</SectionTitle>
          <div className="flex flex-wrap gap-1.5">
            {data.skills.map((skill) => (
              <span
                key={skill}
                className={`rounded-md border border-paper-line px-2.5 py-1 text-[12.5px] font-medium text-paper-body ${
                  marked.has(skill.toLowerCase().trim()) ? "bg-mark" : ""
                }`}
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {data.education.length > 0 && (
        <section className="flex flex-col gap-2">
          <SectionTitle>Educación</SectionTitle>
          {data.education.map((ed, i) => (
            <div key={i} className="flex items-baseline justify-between gap-4">
              <span className="text-[13.5px] font-semibold text-paper-ink">
                {[ed.degree, ed.field].filter(Boolean).join(" en ")}
                {ed.degree || ed.field ? " — " : ""}
                {ed.institution}
              </span>
              <span className="whitespace-nowrap text-[12.5px] text-paper-muted">
                {dateRange(ed.startDate, ed.endDate)}
              </span>
            </div>
          ))}
        </section>
      )}

      {languages.length > 0 && (
        <section className="flex flex-col gap-2">
          <SectionTitle>Idiomas</SectionTitle>
          <p className="text-[13.5px] text-paper-body">{languages.join(" · ")}</p>
        </section>
      )}

      {certifications.length > 0 && (
        <section className="flex flex-col gap-2">
          <SectionTitle>Certificaciones</SectionTitle>
          <p className="text-[13.5px] text-paper-body">
            {certifications.join(" · ")}
          </p>
        </section>
      )}
    </article>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-muted-soft">
      {children}
    </h3>
  );
}
