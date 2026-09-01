import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  orderStatusFor,
  verifyEventChecksum,
  type WompiEvent,
} from "@/lib/wompi";
import { toCents } from "@/lib/plan";

/**
 * Webhook de Wompi: la ÚNICA fuente de verdad sobre si un pago ocurrió.
 *
 * La URL de retorno del checkout la controla el usuario (puede abrirla a
 * mano), así que ahí no se acredita nada. Aquí sí, y solo después de
 * verificar la firma del evento con WOMPI_EVENTS_SECRET.
 *
 * Configurar en el panel de Wompi como:
 *   https://<tu-dominio>/api/wompi/webhook
 */
export async function POST(request: Request) {
  let event: WompiEvent;

  try {
    event = (await request.json()) as WompiEvent;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  let checksumOk: boolean;
  try {
    checksumOk = verifyEventChecksum(event);
  } catch (err) {
    // Falta WOMPI_EVENTS_SECRET: es un problema nuestro, no de Wompi.
    console.error("[wompi] no se pudo verificar el evento:", err);
    return NextResponse.json({ error: "Webhook mal configurado" }, { status: 500 });
  }

  if (!checksumOk) {
    console.warn("[wompi] evento con firma inválida, descartado");
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const transaction = event.data?.transaction;
  const reference = transaction?.reference;

  if (!reference) {
    // Evento válido pero sin referencia: nada que hacer. Se responde 200
    // para que Wompi no lo reintente en bucle.
    return NextResponse.json({ ok: true, ignored: "sin referencia" });
  }

  const supabase = createAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("credit_orders")
    .select("id, user_id, credits, amount_cop, status")
    .eq("reference", reference)
    .maybeSingle();

  if (orderError) {
    console.error("[wompi] error leyendo la orden:", orderError.message);
    return NextResponse.json({ error: "Error de base de datos" }, { status: 500 });
  }

  if (!order) {
    console.warn(`[wompi] referencia desconocida: ${reference}`);
    return NextResponse.json({ ok: true, ignored: "orden no encontrada" });
  }

  const status = orderStatusFor(transaction?.status);

  await supabase
    .from("credit_orders")
    .update({
      status,
      wompi_transaction_id: transaction?.id ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  if (status !== "approved") {
    return NextResponse.json({ ok: true, status });
  }

  // El monto pagado tiene que coincidir con el de la orden que abrimos.
  // Si no coincide, alguien manipuló el checkout: no se acredita.
  const expectedCents = toCents(order.amount_cop);
  if (
    typeof transaction?.amount_in_cents === "number" &&
    transaction.amount_in_cents !== expectedCents
  ) {
    console.error(
      `[wompi] monto distinto para ${reference}: llegó ${transaction.amount_in_cents}, se esperaba ${expectedCents}`
    );
    await supabase
      .from("credit_orders")
      .update({ status: "error", updated_at: new Date().toISOString() })
      .eq("id", order.id);
    return NextResponse.json({ error: "Monto inconsistente" }, { status: 400 });
  }

  // Idempotente: si este pago ya se acreditó, devuelve false y no suma.
  const { data: granted, error: grantError } = await supabase.rpc(
    "grant_purchased_credits",
    {
      p_user_id: order.user_id,
      p_amount: order.credits,
      p_reference: reference,
    }
  );

  if (grantError) {
    console.error("[wompi] no se pudieron acreditar:", grantError.message);
    // 500 para que Wompi reintente: la orden quedó aprobada pero sin saldo.
    return NextResponse.json({ error: "No se pudo acreditar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status, granted: granted === true });
}
