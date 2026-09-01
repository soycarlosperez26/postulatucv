"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { GoogleButton } from "@/components/GoogleButton";
import { AuthShell } from "@/components/auth/AuthShell";
import { Field, inputClass } from "@/components/ui/Field";

export default function RegisterPage() {
  const [state, formAction] = useActionState(signUp, undefined);

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Es gratis. Sube tu CV y analiza tu primera oferta hoy."
      footer={
        <p className="text-center text-sm text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-semibold text-brand hover:text-rust">
            Inicia sesión
          </Link>
        </p>
      }
    >
      <GoogleButton />

      <div className="flex items-center gap-3 text-xs text-faint">
        <span className="h-px flex-1 bg-line" />
        o con tu correo
        <span className="h-px flex-1 bg-line" />
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <FormError message={state?.error} />

        <Field id="email" label="Correo">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
          />
        </Field>

        <Field id="password" label="Contraseña" hint="Mínimo 6 caracteres.">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            className={inputClass}
          />
        </Field>

        <SubmitButton pendingLabel="Creando cuenta…" className="w-full">
          Crear cuenta
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
