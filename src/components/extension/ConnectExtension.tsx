"use client";

import { useEffect, useState, useTransition } from "react";
import { connectExtension, disconnectExtension } from "@/lib/actions/extension";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/FormError";
import { CheckIcon } from "@/components/ui/Icons";

/**
 * Entrega el token a la extensión sin copiar y pegar.
 *
 * La página lo publica con window.postMessage y el content script de la
 * extensión, que corre en nuestro propio dominio, lo recoge. Así la web
 * no necesita conocer el id de la extensión — que en modo desarrollador
 * cambia en cada instalación.
 *
 * Si la extensión no está instalada nadie responde, así que también se
 * muestra el token para pegarlo a mano.
 */
export function ConnectExtension({ yaConectada }: { yaConectada: boolean }) {
  const [pending, startTransition] = useTransition();
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [recibido, setRecibido] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // La extensión confirma que guardó el token.
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.source !== window) return;
      if (event.data?.source === "postula-extension" && event.data?.type === "token-guardado") {
        setRecibido(true);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function conectar() {
    setError(undefined);
    setRecibido(false);
    startTransition(async () => {
      const state = await connectExtension();
      if (state.error) {
        setError(state.error);
        return;
      }
      if (state.token) {
        setToken(state.token);
        window.postMessage(
          { source: "postula-web", type: "token-nuevo", token: state.token },
          window.location.origin
        );
      }
    });
  }

  function desconectar() {
    setError(undefined);
    startTransition(async () => {
      const state = await disconnectExtension();
      if (state.error) setError(state.error);
      else {
        setToken(null);
        setRecibido(false);
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={conectar} disabled={pending}>
          {pending
            ? "Generando…"
            : yaConectada
              ? "Generar un token nuevo"
              : "Conectar extensión"}
        </Button>
        {yaConectada && (
          <Button variant="ghost" onClick={desconectar} disabled={pending}>
            Desconectar
          </Button>
        )}
      </div>

      <FormError message={error} />

      {recibido && (
        <p className="flex items-center gap-2 text-[13.5px] font-semibold text-brand">
          <CheckIcon className="h-4 w-4" />
          La extensión recibió el token y ya quedó conectada.
        </p>
      )}

      {token && (
        <div className="flex flex-col gap-2 rounded-card border border-line bg-canvas px-4 py-3.5">
          <p className="text-[12.5px] text-muted text-pretty">
            {recibido
              ? "Guarda este token solo si necesitas conectar otro equipo. No volverá a mostrarse."
              : "Si la extensión no respondió, cópialo y pégalo en su ventana. No volverá a mostrarse."}
          </p>
          <div className="flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-md border border-line bg-surface px-3 py-2 font-mono text-[12.5px] text-ink">
              {token}
            </code>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(token);
                setCopiado(true);
                setTimeout(() => setCopiado(false), 2000);
              }}
            >
              {copiado ? "Copiado" : "Copiar"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
