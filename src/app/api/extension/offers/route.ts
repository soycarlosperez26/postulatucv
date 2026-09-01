import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Endpoint que usa la extensión de Chrome para guardar una oferta.
 *
 * Se autentica con un token personal (Authorization: Bearer), no con la
 * cookie de sesión: ver supabase/migrations/004_extension_tokens.sql
 * para el porqué. Al no usar cookies, no hay superficie de CSRF.
 *
 * Aplica las mismas reglas que `addJobOffer` en src/lib/actions/offers.ts
 * y, como aquella, NO llama a DeepSeek: el análisis sigue siendo perezoso
 * y no gasta créditos.
 */

const MIN_DESCRIPCION = 200;

/** El navegador pide permiso antes del POST desde la extensión. */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Authorization, Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

function json(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export async function POST(request: Request) {
  const token = bearerToken(request);
  if (!token) {
    return json({ error: "Falta el token de la extensión." }, 401);
  }

  let payload: {
    title?: unknown;
    company?: unknown;
    description?: unknown;
    sourceUrl?: unknown;
  };

  try {
    payload = await request.json();
  } catch {
    return json({ error: "Cuerpo inválido." }, 400);
  }

  const title = String(payload.title ?? "").trim();
  const company = String(payload.company ?? "").trim();
  const description = String(payload.description ?? "").trim();
  const sourceUrl = String(payload.sourceUrl ?? "").trim();

  if (!title || !company) {
    return json({ error: "Faltan la empresa o el cargo." }, 400);
  }

  if (description.length < MIN_DESCRIPCION) {
    return json(
      {
        error:
          "La descripción es demasiado corta para analizarla. Complétala antes de guardar.",
        field: "description",
      },
      400
    );
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch (err) {
    console.error("[extension] cliente admin no disponible:", err);
    return json({ error: "El servidor no está configurado." }, 500);
  }

  const hash = createHash("sha256").update(token).digest("hex");
  const { data: userId, error: tokenError } = await supabase.rpc(
    "resolve_extension_token",
    { p_hash: hash }
  );

  if (tokenError) {
    console.error("[extension] no se pudo validar el token:", tokenError.message);
    return json({ error: "No se pudo validar el token." }, 500);
  }

  if (!userId) {
    return json({ error: "Token inválido o revocado. Vuelve a conectar la extensión." }, 401);
  }

  // Guardar dos veces la misma oferta no crea filas repetidas: se
  // devuelve la que ya existía. Es fácil dar clic dos veces.
  if (sourceUrl) {
    const { data: existente } = await supabase
      .from("job_offers")
      .select("id")
      .eq("user_id", userId)
      .eq("source_url", sourceUrl)
      .limit(1)
      .maybeSingle();

    if (existente) {
      return json(
        { id: existente.id, duplicated: true, path: `/dashboard/offers/${existente.id}` },
        200
      );
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from("job_offers")
    .insert({
      user_id: userId,
      company,
      title,
      source_url: sourceUrl || null,
      raw_description: description,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[extension] no se pudo guardar:", insertError?.message);
    return json({ error: "No se pudo guardar la oferta." }, 500);
  }

  return json(
    { id: inserted.id, duplicated: false, path: `/dashboard/offers/${inserted.id}` },
    201
  );
}
