import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Integración con Wompi (Bancolombia): PSE, Nequi, tarjetas y efectivo.
 *
 * Se usa el Checkout Web por redirección en vez del widget embebido:
 * así no entra un script de terceros en nuestras páginas.
 */

const CHECKOUT_URL = "https://checkout.wompi.co/p/";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}.`);
  }
  return value;
}

/**
 * Firma de integridad que exige el Checkout: evita que alguien cambie el
 * monto en la URL antes de pagar.
 * SHA256(referencia + montoEnCentavos + moneda + secreto_de_integridad)
 */
export function integritySignature(
  reference: string,
  amountInCents: number,
  currency = "COP"
): string {
  const secret = requireEnv("WOMPI_INTEGRITY_SECRET");
  return createHash("sha256")
    .update(`${reference}${amountInCents}${currency}${secret}`)
    .digest("hex");
}

export function buildCheckoutUrl(params: {
  reference: string;
  amountInCents: number;
  redirectUrl: string;
  customerEmail?: string;
}): string {
  const currency = "COP";

  const entries: Array<[string, string]> = [
    ["public-key", requireEnv("WOMPI_PUBLIC_KEY")],
    ["currency", currency],
    ["amount-in-cents", String(params.amountInCents)],
    ["reference", params.reference],
    [
      "signature:integrity",
      integritySignature(params.reference, params.amountInCents, currency),
    ],
    ["redirect-url", params.redirectUrl],
  ];

  if (params.customerEmail) {
    entries.push(["customer-data:email", params.customerEmail]);
  }

  // La query se arma a mano en vez de con URLSearchParams porque este
  // codifica los dos puntos de "signature:integrity" y
  // "customer-data:email" como %3A. Es válido según el RFC, pero Wompi
  // documenta el nombre literal y no vale la pena arriesgarse: los dos
  // puntos son legales sin escapar dentro de una query.
  const query = entries
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return `${CHECKOUT_URL}?${query}`;
}

// ============================================================
// Eventos (webhook)
// ============================================================

export type WompiTransactionStatus =
  | "APPROVED"
  | "DECLINED"
  | "VOIDED"
  | "ERROR"
  | "PENDING";

export interface WompiEvent {
  event: string;
  data: {
    transaction?: {
      id?: string;
      reference?: string;
      status?: WompiTransactionStatus;
      amount_in_cents?: number;
      currency?: string;
    };
  };
  sent_at?: string;
  timestamp: number;
  signature: {
    properties: string[];
    checksum: string;
  };
}

/** Lee "transaction.amount_in_cents" dentro de event.data. */
function readPath(source: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      source
    );
}

/**
 * Verifica el checksum del evento. Este es el único punto en el que la
 * app decide que un pago es real: la URL de retorno la controla el
 * usuario y no se le cree nada.
 *
 * checksum = SHA256(valores de signature.properties + timestamp + secreto)
 */
export function verifyEventChecksum(event: WompiEvent): boolean {
  const secret = requireEnv("WOMPI_EVENTS_SECRET");

  if (!event?.signature?.checksum || !Array.isArray(event.signature.properties)) {
    return false;
  }

  const concatenated = event.signature.properties
    .map((property) => {
      const value = readPath(event.data, property);
      return value === undefined || value === null ? "" : String(value);
    })
    .join("");

  const computed = createHash("sha256")
    .update(`${concatenated}${event.timestamp}${secret}`)
    .digest("hex")
    .toUpperCase();

  const received = event.signature.checksum.toUpperCase();

  // Comparación en tiempo constante; timingSafeEqual exige mismo largo.
  if (computed.length !== received.length) return false;
  return timingSafeEqual(Buffer.from(computed), Buffer.from(received));
}

/** Estado de Wompi -> estado de nuestra tabla credit_orders. */
export function orderStatusFor(
  status: WompiTransactionStatus | undefined
): "pending" | "approved" | "declined" | "voided" | "error" {
  switch (status) {
    case "APPROVED":
      return "approved";
    case "DECLINED":
      return "declined";
    case "VOIDED":
      return "voided";
    case "ERROR":
      return "error";
    default:
      return "pending";
  }
}
