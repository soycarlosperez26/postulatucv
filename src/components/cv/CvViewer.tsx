"use client";

import { useState } from "react";
import { CvDocument, type CvDocumentData } from "@/components/cv/CvDocument";

/**
 * El contraste entre el CV adaptado y el CV Maestro es el argumento
 * central del producto: el usuario tiene que poder comprobar, de un
 * clic, que su CV original sigue intacto y que la versión adaptada solo
 * reordena y reescribe lo que él ya había puesto.
 */
export function CvViewer({
  tailored,
  base,
  matchedKeywords,
}: {
  tailored: CvDocumentData;
  base: CvDocumentData;
  matchedKeywords: string[];
}) {
  const [view, setView] = useState<"adaptado" | "maestro">("adaptado");
  const [highlight, setHighlight] = useState(true);
  const isAdaptado = view === "adaptado";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-0.5 rounded-control bg-line-soft p-0.5">
          {(["adaptado", "maestro"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={`h-8 rounded-[7px] px-3.5 text-[13px] font-semibold transition ${
                view === v
                  ? "bg-surface text-ink shadow-[0_1px_3px_rgba(32,27,20,0.14)]"
                  : "text-muted hover:text-ink"
              }`}
            >
              {v === "adaptado" ? "CV adaptado" : "CV Maestro"}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setHighlight((h) => !h)}
          disabled={!isAdaptado}
          className="flex items-center gap-2.5 disabled:opacity-40"
          aria-pressed={highlight}
        >
          <span
            className={`flex h-[23px] w-10 items-center rounded-full p-[3px] transition ${
              highlight && isAdaptado ? "bg-brand" : "bg-line-strong"
            } ${highlight ? "justify-end" : "justify-start"}`}
          >
            <span className="h-[17px] w-[17px] rounded-full bg-surface" />
          </span>
          <span className="text-[13.5px] font-semibold text-ink-soft">
            Resaltar coincidencias
          </span>
        </button>
      </div>

      <CvDocument
        data={isAdaptado ? tailored : base}
        highlightSkills={highlight && isAdaptado ? matchedKeywords : []}
      />

      <p className="text-[12.5px] text-muted text-pretty">
        {isAdaptado
          ? "Resaltadas, las habilidades de tu CV que la oferta pedía explícitamente. Ninguna experiencia fue inventada: esta versión reordena y reescribe lo que ya estaba en tu CV Maestro."
          : "Este es tu CV Maestro, tal como lo subiste. Generar versiones adaptadas nunca lo modifica."}
      </p>
    </div>
  );
}
