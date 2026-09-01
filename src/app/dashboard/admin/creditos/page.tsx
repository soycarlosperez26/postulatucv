import { notFound } from "next/navigation";
import { currentUserIsAdmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatCop } from "@/lib/plan";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { InfoIcon } from "@/components/ui/Icons";
import { AdminOrderActions } from "@/components/credits/AdminOrderActions";

/**
 * Bandeja de recargas pendientes.
 *
 * A quien no sea administrador se le devuelve un 404, no un "no tienes
 * permiso": no hace falta confirmarle a un desconocido que esta ruta
 * existe. La comprobación se repite dentro de cada server action, que
 * es donde realmente importa.
 */
export default async function AdminCreditosPage() {
  if (!(await currentUserIsAdmin())) {
    notFound();
  }

  let pendientes: Array<{
    reference: string;
    email: string;
    pack_id: string;
    credits: number;
    amount_cop: number;
    channel: string;
    created_at: string;
  }> = [];
  let errorMsg: string | null = null;

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("list_pending_orders");
    if (error) throw new Error(error.message);
    pendientes = data ?? [];
  } catch (err) {
    errorMsg =
      err instanceof Error ? err.message : "No se pudieron leer las solicitudes.";
  }

  return (
    <>
      <header className="border-b border-line bg-surface px-8 py-[18px]">
        <h1 className="font-display text-[23px] font-bold tracking-[-0.02em] text-ink">
          Recargas pendientes
        </h1>
        <p className="text-[13.5px] text-muted">
          Acredita los créditos cuando confirmes el pago por WhatsApp.
        </p>
      </header>

      <div className="flex max-w-4xl flex-col gap-5 px-8 py-7">
        {errorMsg ? (
          <Card className="flex items-start gap-2.5 px-6 py-5">
            <InfoIcon className="mt-px h-[18px] w-[18px] shrink-0 text-clay" />
            <div className="flex flex-col gap-1">
              <CardTitle className="text-[15px]">
                No se pudieron cargar las solicitudes
              </CardTitle>
              <p className="text-[13px] text-muted text-pretty">{errorMsg}</p>
              <p className="text-[12.5px] text-muted-soft text-pretty">
                Revisa que SUPABASE_SERVICE_ROLE_KEY esté definida y que la
                migración 003 esté aplicada.
              </p>
            </div>
          </Card>
        ) : pendientes.length === 0 ? (
          <Card className="px-6 py-14 text-center">
            <CardTitle>No hay solicitudes pendientes</CardTitle>
            <p className="mt-2 text-sm text-muted">
              Aquí aparecen las recargas que los usuarios piden por WhatsApp.
            </p>
          </Card>
        ) : (
          <Card className="flex flex-col px-6 py-2">
            {pendientes.map((orden, i) => (
              <div
                key={orden.reference}
                className={`flex flex-wrap items-center gap-5 py-4 ${
                  i < pendientes.length - 1 ? "border-b border-line-soft" : ""
                }`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-display text-[17px] font-bold tracking-[0.02em] text-ink">
                      {orden.reference}
                    </span>
                    <Badge tone="amber">
                      {orden.credits} créditos · {formatCop(orden.amount_cop)}
                    </Badge>
                    {orden.channel !== "whatsapp" && (
                      <Badge>{orden.channel}</Badge>
                    )}
                  </div>
                  <span className="truncate text-[13px] text-muted">
                    {orden.email} · pedida el{" "}
                    {new Date(orden.created_at).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>

                <AdminOrderActions reference={orden.reference} />
              </div>
            ))}
          </Card>
        )}

        <div className="flex items-start gap-2.5 rounded-card border border-line bg-surface px-5 py-4">
          <InfoIcon className="mt-px h-[18px] w-[18px] shrink-0 text-rust" />
          <p className="text-[12.5px] text-muted text-pretty">
            Acreditar es idempotente: si le das dos veces al mismo código, los
            créditos se suman una sola vez. Descartar no toca ningún saldo.
          </p>
        </div>
      </div>
    </>
  );
}
