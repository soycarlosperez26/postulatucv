/**
 * Planes y créditos — TODAVÍA NO ESTÁN EN LA BASE DE DATOS.
 *
 * El diseño del dashboard muestra créditos y el paso a Pro, pero no hay
 * tabla que los respalde: `supabase/schema.sql` solo tiene base_profiles,
 * job_offers y tailored_cvs. Estos valores son fijos y la tarjeta se
 * muestra en estado informativo hasta que exista el modelo real
 * (tabla `credits` o similar + descuento dentro de generateCustomCv).
 *
 * Precios según POSTULA v1.0.
 */
export const PLAN_LABEL = "Plan Free";

export const PRO_MONTHLY_COP = "$19.900/mes";
export const PRO_YEARLY_COP = "$199.000/año";
export const CREDIT_PACK_COP = "10 créditos por $9.900";

/** Cuántas generaciones al mes incluye el plan gratuito. */
export const FREE_MONTHLY_CREDITS = 10;
