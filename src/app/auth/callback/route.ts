import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

// Requerido por Supabase para OAuth (Google) y confirmación de email:
// el link de Google/email apunta aquí para intercambiar el `code` por una sesión.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  console.log("Auth callback invoked:", {
    hasCode: !!code,
    next,
    configured: isSupabaseConfigured(),
  });

  if (code && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error("exchangeCodeForSession error:", error);
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }
    
    console.log("Auth callback success, redirecting to:", next);
    return NextResponse.redirect(`${origin}${next}`);
  }

  console.log("Auth callback failed: no code or not configured");
  return NextResponse.redirect(`${origin}/login`);
}
