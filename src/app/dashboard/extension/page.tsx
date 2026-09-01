import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { InfoIcon } from "@/components/ui/Icons";
import { ConnectExtension } from "@/components/extension/ConnectExtension";

function fecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function ExtensionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: token } = await supabase
    .from("extension_tokens")
    .select("created_at, last_used_at")
    .eq("user_id", user.id)
    .is("revoked_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <>
      <header className="border-b border-line bg-surface px-8 py-[18px]">
        <h1 className="font-display text-[23px] font-bold tracking-[-0.02em] text-ink">
          Extensión de Chrome
        </h1>
        <p className="text-[13.5px] text-muted">
          Guarda ofertas desde el portal donde las encuentras, sin copiar ni
          pegar.
        </p>
      </header>

      <div className="flex max-w-3xl flex-col gap-5 px-8 py-7">
        <Card className="flex flex-col gap-4 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Estado</CardTitle>
            {token ? (
              <Badge tone="brand">Conectada</Badge>
            ) : (
              <Badge>Sin conectar</Badge>
            )}
          </div>

          {token && (
            <p className="text-[13px] text-muted">
              Conectada el {fecha(token.created_at)}.{" "}
              {token.last_used_at
                ? `Última captura el ${fecha(token.last_used_at)}.`
                : "Todavía no ha guardado ninguna oferta."}
            </p>
          )}

          <ConnectExtension yaConectada={Boolean(token)} />

          <p className="text-[12.5px] text-muted-soft text-pretty">
            Solo puede haber una extensión conectada a la vez. Generar un token
            nuevo desconecta el equipo anterior.
          </p>
        </Card>

        <Card className="flex flex-col gap-3 px-6 py-5">
          <CardTitle>Cómo instalarla</CardTitle>
          <ol className="flex flex-col gap-2.5">
            {[
              "Descarga la carpeta de la extensión y descomprímela.",
              "Abre chrome://extensions y activa el Modo de desarrollador.",
              'Da clic en "Cargar descomprimida" y elige esa carpeta.',
              'Vuelve aquí y presiona "Conectar extensión".',
            ].map((paso, i) => (
              <li key={paso} className="flex gap-2.5">
                <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-line-soft font-display text-[12px] font-bold text-ink-soft">
                  {i + 1}
                </span>
                <span className="text-[13.5px] text-ink-soft text-pretty">
                  {paso}
                </span>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="flex flex-col gap-3 px-6 py-5">
          <CardTitle>Cómo se usa</CardTitle>
          <p className="text-[13.5px] text-ink-soft text-pretty">
            En Computrabajo y elempleo la extensión detecta sola que estás en una
            oferta. En cualquier otro portal, da clic en su ícono y hará el mejor
            intento de leer la página.
          </p>
          <p className="text-[13.5px] text-ink-soft text-pretty">
            Siempre te muestra lo que encontró antes de guardar, para que
            corrijas lo que haga falta. Guardar una oferta no consume créditos:
            el análisis lo lanzas tú desde el panel cuando quieras.
          </p>
          <div className="flex items-start gap-2.5 border-t border-line-soft pt-3">
            <InfoIcon className="mt-px h-4 w-4 shrink-0 text-rust" />
            <p className="text-[12.5px] text-muted text-pretty">
              La extensión solo lee la página que ya tienes abierta cuando se lo
              pides. No navega por su cuenta ni recopila tu historial.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
