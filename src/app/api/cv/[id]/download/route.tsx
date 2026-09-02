import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { CvPdfDocument } from "@/components/cv/CvPdfDocument";

function sanitizeFilename(company: string, title: string, name: string): string {
  const parts = [name, company, title].filter(Boolean);
  const raw = parts.join("_");
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "")
    .substring(0, 200);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const [{ data: offer }, { data: cv }] = await Promise.all([
    supabase
      .from("job_offers")
      .select("company, title")
      .eq("id", id)
      .eq("user_id", user.id)
      .single(),
    supabase
      .from("tailored_cvs")
      .select("content")
      .eq("job_offer_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!offer || !cv) {
    return NextResponse.json(
      { error: "CV adaptado no encontrado" },
      { status: 404 }
    );
  }

  const { data: profile } = await supabase
    .from("base_profiles")
    .select("parsed")
    .eq("user_id", user.id)
    .maybeSingle();

  const personName = profile?.parsed?.contact?.name || "CV";
  const filename = sanitizeFilename(offer.company, offer.title, personName);

  try {
    const stream = await renderToStream(
      <CvPdfDocument data={cv.content} />
    );

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set(
      "Content-Disposition",
      `attachment; filename="${filename}.pdf"`
    );

    return new NextResponse(stream as unknown as ReadableStream, { headers });
  } catch (error) {
    console.error("[pdf] error generando PDF:", error);
    return NextResponse.json(
      { error: "Error generando el PDF" },
      { status: 500 }
    );
  }
}
