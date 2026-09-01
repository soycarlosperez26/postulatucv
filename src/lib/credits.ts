import { createClient } from "@/lib/supabase/server";

export interface CreditBalance {
  /** Gratuitos del mes. Se reinician y no se acumulan. */
  free: number;
  /** Comprados. Se acumulan y no vencen. */
  purchased: number;
  total: number;
}

/**
 * Saldo del usuario de la sesión.
 *
 * Devuelve `null` —y no un saldo en cero— cuando la consulta falla, para
 * que la interfaz pueda distinguir "no tienes créditos" de "no pude
 * leer tu saldo". Confundirlas haría que un fallo de base de datos
 * pareciera falta de saldo.
 */
export async function getBalance(): Promise<CreditBalance | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_credit_balance");

  if (error || !data || data.length === 0) {
    if (error) {
      console.error("[credits] no se pudo leer el saldo:", error.message);
    }
    return null;
  }

  const row = data[0];
  return {
    free: row.free,
    purchased: row.purchased,
    total: row.total,
  };
}

export type ConsumeResult =
  | { ok: true }
  | { ok: false; reason: "sin_creditos" }
  | { ok: false; reason: "error"; message: string };

/**
 * Cobra un crédito antes de generar. La función de Postgres bloquea la
 * fila del usuario, así que dos envíos simultáneos no pueden gastar el
 * mismo crédito dos veces.
 *
 * `reference` identifica el consumo para poder devolverlo si la
 * generación falla.
 */
export async function consumeCredit(reference: string): Promise<ConsumeResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("consume_credit", {
    p_reference: reference,
  });

  if (error) {
    console.error("[credits] no se pudo cobrar el crédito:", error.message);
    return {
      ok: false,
      reason: "error",
      message: "No pudimos verificar tus créditos. Inténtalo de nuevo.",
    };
  }

  return data === true ? { ok: true } : { ok: false, reason: "sin_creditos" };
}

/**
 * Devuelve el crédito al cubo del que salió cuando la generación falló.
 * Es idempotente; si algo sale mal aquí solo se registra, porque el
 * error que importa mostrarle al usuario es el de la generación.
 */
export async function refundCredit(reference: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("refund_credit", {
    p_reference: reference,
  });

  if (error) {
    console.error(
      `[credits] no se pudo devolver el crédito ${reference}:`,
      error.message
    );
  }
}
