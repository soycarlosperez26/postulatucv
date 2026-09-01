"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { GoogleButton } from "@/components/GoogleButton";
import { AuthShell } from "@/components/auth/AuthShell";
import { Field, inputClass } from "@/components/ui/Field";

export default function LoginPage() {
  const [state, formAction] = useActionState(signIn, undefined);

  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Entra para ver tus ofertas y tus CV adaptados."
      footer={
        <p className="text-center text-sm text-muted">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-semibold text-brand hover:text-rust">
            Regístrate
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

        <Field id="password" label="Contraseña">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={inputClass}
          />
        </Field>

        <SubmitButton pendingLabel="Entrando…" className="w-full">
          Entrar
        </SubmitButton>
      </form>
    </AuthShell>
  );
}
