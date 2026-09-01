/**
 * Enlace de WhatsApp para coordinar la compra de créditos.
 *
 * El número vive en WHATSAPP_NUMBER (sin NEXT_PUBLIC_) y se lee en el
 * servidor en cada petición: así se cambia sin volver a desplegar.
 */

/** Normaliza a formato internacional sin símbolos: 573001234567. */
export function whatsappNumber(): string | null {
  const raw = process.env.WHATSAPP_NUMBER?.replace(/\D/g, "");
  if (!raw || raw.length < 10) return null;
  return raw;
}

export function whatsappLink(message: string): string | null {
  const number = whatsappNumber();
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Mensaje que el usuario envía ya escrito, con su código de solicitud. */
export function creditRequestMessage(params: {
  reference: string;
  credits: number;
  amountLabel: string;
}): string {
  return [
    `Hola, quiero recargar créditos en Postula.`,
    ``,
    `Paquete: ${params.credits} créditos (${params.amountLabel})`,
    `Mi código: ${params.reference}`,
  ].join("\n");
}
