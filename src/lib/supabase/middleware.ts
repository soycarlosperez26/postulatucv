import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

/**
 * Refresca la sesión de Supabase en cada request y protege las
 * rutas privadas (todo lo que no sea /login, /register o estáticos).
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublicPath =
    path === "/" ||
    path === "/precios" ||
    path === "/privacidad" ||
    path === "/terminos" ||
    path === "/robots.txt" ||
    path === "/sitemap.xml" ||
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/auth") ||
    path.startsWith("/.well-known/") ||
    // El webhook de Wompi llega servidor a servidor, sin cookies. Sin
    // esta excepción se redirige a /login y Wompi recibe un 307 en vez
    // del 200 que espera, así que los pagos nunca se acreditarían.
    // Su autenticación es la firma del evento, no la sesión.
    path.startsWith("/api/wompi") ||
    // Igual que el webhook: la extensión de Chrome no manda cookies, se
    // autentica con un token Bearer. Sin esta excepción recibiría un 307
    // a /login en vez del 401 que necesita para pedir reconexión.
    path.startsWith("/api/extension") ||
    // Archivos de verificación de Google Search Console
    path === "/google7e7c0d192d94a50a.html" ||
    path.startsWith("/guia");

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
