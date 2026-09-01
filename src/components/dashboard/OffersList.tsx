"use client";

import { useState } from "react";
import Link from "next/link";
import { scoreBand } from "@/lib/score";
import { Badge } from "@/components/ui/Badge";
import { ChevronRightIcon } from "@/components/ui/Icons";

export interface OfferRow {
  id: string;
  company: string;
  title: string;
  /** null cuando todavía no se generó un CV a medida para esta oferta */
  score: number | null;
  dateLabel: string;
}

type Filter = "todas" | "listas" | "sin";

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "todas", label: "Todas" },
  { id: "listas", label: "Con CV listo" },
  { id: "sin", label: "Sin analizar" },
];

export function OffersList({ offers }: { offers: OfferRow[] }) {
  const [filter, setFilter] = useState<Filter>("todas");

  const counts = {
    todas: offers.length,
    listas: offers.filter((o) => o.score !== null).length,
    sin: offers.filter((o) => o.score === null).length,
  };

  const visible = offers.filter((o) =>
    filter === "todas"
      ? true
      : filter === "listas"
        ? o.score !== null
        : o.score === null
  );

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-bold tracking-[-0.015em] text-ink">
          Tus ofertas
        </h2>
        <div className="flex items-center gap-1.5">
          {FILTERS.map((f) => {
            const active = f.id === filter;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] font-semibold transition ${
                  active
                    ? "border-brand bg-brand text-surface"
                    : "border-line bg-surface text-ink-soft hover:border-line-strong"
                }`}
              >
                {f.label}
                <span className="text-[11.5px] font-bold opacity-65">
                  {counts[f.id]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-card border border-line bg-surface">
        {visible.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">
            No hay ofertas en este filtro.
          </p>
        ) : (
          visible.map((offer, i) => {
            const band = scoreBand(offer.score);
            return (
              <Link
                key={offer.id}
                href={`/dashboard/offers/${offer.id}`}
                className={`flex items-center gap-4 px-4.5 py-4 transition hover:bg-canvas ${
                  i < visible.length - 1 ? "border-b border-line-soft" : ""
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-line-soft font-display text-base font-bold text-ink-soft">
                  {offer.company.trim().charAt(0).toUpperCase() || "?"}
                </span>

                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[14.5px] font-semibold text-ink">
                    {offer.title}
                  </span>
                  <span className="truncate text-[12.5px] text-muted">
                    {offer.company}
                  </span>
                </span>

                <span className="flex w-32 shrink-0 items-center gap-2">
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-sunken">
                    <span
                      className={`block h-full rounded-full ${band.bar}`}
                      style={{ width: `${offer.score ?? 0}%` }}
                    />
                  </span>
                  <span
                    className={`w-10 text-right font-display text-sm font-bold ${band.text}`}
                  >
                    {band.label}
                  </span>
                </span>

                <span className="flex w-[124px] shrink-0">
                  {offer.score === null ? (
                    <Badge>Sin analizar</Badge>
                  ) : (
                    <Badge tone="brand">CV adaptado listo</Badge>
                  )}
                </span>

                <span className="w-20 shrink-0 text-right text-[12.5px] text-faint">
                  {offer.dateLabel}
                </span>

                <ChevronRightIcon className="h-[18px] w-[18px] shrink-0 text-line-strong" />
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
