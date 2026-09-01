/**
 * Constantes del modelo de cobro.
 *
 * Los paquetes NO viven aquí: están en la tabla `credit_packs`
 * (supabase/migrations/002_credits.sql) para que el precio nunca venga
 * del cliente y se pueda ajustar sin desplegar. Este archivo solo tiene
 * lo que la UI necesita para presentarlos.
 */

/** Créditos gratuitos que recibe cada usuario al mes. No se acumulan. */
export const FREE_MONTHLY_CREDITS = 1;

/** El paquete que se destaca en la página de compra. */
export const RECOMMENDED_PACK_ID = "p15";

export interface CreditPack {
  id: string;
  credits: number;
  amountCop: number;
  label: string;
}

export function formatCop(amount: number): string {
  return `$${amount.toLocaleString("es-CO")}`;
}

/** "$1.333 por crédito" — el número que hace comparables los paquetes. */
export function pricePerCredit(amountCop: number, credits: number): string {
  return formatCop(Math.round(amountCop / credits));
}

/** Wompi cobra en centavos, también para COP. */
export function toCents(amountCop: number): number {
  return amountCop * 100;
}
