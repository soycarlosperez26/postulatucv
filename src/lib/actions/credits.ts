"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { buildCheckoutUrl } from "@/lib/wompi";
import { toCents } from "@/lib/plan";

/**
 * Origen público de la app, derivado de la petición.
 *
 * A propósito NO usa NEXT_PUBLIC_SITE_URL: esa variable se hornea en el
 * build y ya causó una vez que producción redirigiera a localhost. Los
 * encabezados siempre traen el dominio real por el que entró el usuario.
 */
async function currentOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto =
    h.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");

  if (!host) {
    throw new Error("No se pudo determinar el dominio de la aplicación.");
  }
  return `${proto}://${host}`;
}

export interface BuyCreditsState {
  error?: string;
}

/**
 * Abre una solicitud de recarga y manda al usuario a la pantalla con su
 * código, desde donde escribe por WhatsApp.
 *
 * No mueve el saldo: los créditos los acredita el administrador desde
 * /dashboard/admin/creditos cuando confirma el pago.
 *
 * Si el usuario ya tiene una solicitud pendiente del mismo paquete,
 * `create_credit_order` devuelve esa misma en vez de generar códigos
 * nuevos a cada clic.
 */
export async function requestCredits(
  _prevState: unknown,
  formData: FormData
): Promise<BuyCreditsState> {
  const packId = String(formData.get("packId") ?? "");
  if (!packId) {
    return { error: "Selecciona un paquete." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: order, error } = await supabase.rpc("create_credit_order", {
    p_pack_id: packId,
    p_channel: "whatsapp",
  });

  if (error || !order) {
    console.error("[credits] no se pudo abrir la solicitud:", error?.message);
    return {
      error: "No pudimos crear tu solicitud. Inténtalo de nuevo en un momento.",
    };
  }

  redirect(`/dashboard/creditos/solicitud?ref=${order.reference}`);
}

/**
 * DORMIDA: el cobro por Wompi está desconectado de la interfaz mientras
 * se resuelve la habilitación del comercio. Se conserva junto con
 * src/lib/wompi.ts y el webhook para poder reactivarla.
 *
 * Abre una orden de compra y manda al usuario al Checkout de Wompi.
 * Del cliente solo llega el id del paquete: los créditos y el monto los
 * pone `create_credit_order` leyendo la tabla `credit_packs`, así que un
 * precio manipulado en el formulario no tiene efecto.
 */
export async function buyCredits(
  _prevState: unknown,
  formData: FormData
): Promise<BuyCreditsState> {
  const packId = String(formData.get("packId") ?? "");
  if (!packId) {
    return { error: "Selecciona un paquete." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: order, error } = await supabase.rpc("create_credit_order", {
    p_pack_id: packId,
    p_channel: "wompi",
  });

  if (error || !order) {
    console.error("[credits] no se pudo abrir la orden:", error?.message);
    return {
      error: "No pudimos iniciar la compra. Inténtalo de nuevo en un momento.",
    };
  }

  let checkoutUrl: string;
  try {
    const origin = await currentOrigin();
    checkoutUrl = buildCheckoutUrl({
      reference: order.reference,
      amountInCents: toCents(order.amount_cop),
      redirectUrl: `${origin}/dashboard/creditos/resultado?ref=${order.reference}`,
      customerEmail: user.email ?? undefined,
    });
  } catch (err) {
    console.error("[credits] checkout mal configurado:", err);
    return {
      error:
        "Los pagos todavía no están configurados en este entorno. Avísale al equipo.",
    };
  }

  redirect(checkoutUrl);
}
