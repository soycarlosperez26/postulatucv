"use client";

import { Suspense, useActionState, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { FormError } from "@/components/FormError";
import { GoogleButton } from "@/components/GoogleButton";
import { AuthShell } from "@/components/auth/AuthShell";
import { Field, inputClass } from "@/components/ui/Field";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction] = useActionState(signIn, undefined);
  const [urlError, setUrlError] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "auth_callback_failed") {
      setUrlError("Error al iniciar sesión con Google. Por favor, intenta de nuevo.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (state && 'success' in state && state.success && 'redirectTo' in state) {
      router.push(state.redirectTo as string);
    }
  }, [state, router]);

  return (
    <>
      <GoogleButton />

      <div className="flex items-center gap-3 text-xs text-faint">
        <span className="h-px flex-1 bg-line" />
        o con tu correo
        <span className="h-px flex-1 bg-line" />
      </div>

      <form
        action={formAction}
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          const form = e.currentTarget;
          const email = (form.elements.namedItem("email") as HTMLInputElement)?.value;
          if (email) {
            import("@/lib/analytics").then((m) => m.trackLogin());
          }
        }}
      >
        <FormError message={urlError || state?.error} />

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
    </>
  );
}

export default function LoginPage() {
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
      <Suspense fallback={
        <div className="flex flex-col gap-4">
          <div className="h-10 w-full animate-pulse rounded-control bg-line" />
          <div className="flex items-center gap-3 text-xs text-faint">
            <span className="h-px flex-1 bg-line" />
            o con tu correo
            <span className="h-px flex-1 bg-line" />
          </div>
          <div className="h-20 w-full animate-pulse rounded-control bg-line" />
          <div className="h-20 w-full animate-pulse rounded-control bg-line" />
          <div className="h-10 w-full animate-pulse rounded-control bg-line" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
