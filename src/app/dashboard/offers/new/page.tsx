"use client";

import { useActionState } from "react";
import Link from "next/link";
import { addJobOffer } from "@/lib/actions/offers";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { Card, CardTitle } from "@/components/ui/Card";
import { Field, inputClass } from "@/components/ui/Field";
import { ChevronRightIcon } from "@/components/ui/Icons";

export default function NewOfferPage() {
  const [state, formAction] = useActionState(addJobOffer, undefined);

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
          <span className="font-semibold text-ink-soft">Nueva oferta</span>
        </nav>
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-[23px] font-bold tracking-[-0.02em] text-ink">
            Analizar una oferta
          </h1>
          <p className="text-[13.5px] text-muted">
            Pega la publicación completa. Entre más texto original, mejor es el
            cruce con tu CV Maestro.
          </p>
        </div>
      </header>

      <div className="px-8 py-7">
        <Card className="max-w-2xl px-6 py-6">
          <form action={formAction} className="flex flex-col gap-5">
            <CardTitle>Datos de la vacante</CardTitle>

            <FormError message={state?.error} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field id="company" label="Empresa">
                <input
                  id="company"
                  name="company"
                  required
                  placeholder="Rappi"
                  className={inputClass}
                />
              </Field>
              <Field id="title" label="Cargo">
                <input
                  id="title"
                  name="title"
                  required
                  placeholder="Desarrollador Frontend Senior"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field
              id="sourceUrl"
              label="Enlace de la oferta (opcional)"
              hint="Se guarda solo como referencia; en esta versión no se lee automáticamente."
            >
              <input
                id="sourceUrl"
                name="sourceUrl"
                type="url"
                placeholder="https://www.elempleo.com/..."
                className={inputClass}
              />
            </Field>

            <Field
              id="rawDescription"
              label="Descripción de la oferta"
              hint="De aquí se extraen los requisitos y las palabras clave con las que se calcula tu match ATS."
            >
              <textarea
                id="rawDescription"
                name="rawDescription"
                required
                rows={12}
                placeholder="Pega aquí el texto completo de la publicación…"
                className={`${inputClass} resize-y leading-[1.6]`}
              />
            </Field>

            <div className="flex items-center gap-3">
              <SubmitButton pendingLabel="Guardando oferta…">
                Guardar oferta
              </SubmitButton>
              <Link
                href="/dashboard/offers"
                className="text-[13.5px] font-semibold text-muted hover:text-ink"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}
