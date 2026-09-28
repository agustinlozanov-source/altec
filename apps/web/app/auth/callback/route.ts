import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { publicOrigin } from "@/lib/origin";

/**
 * El aterrizaje del enlace del correo.
 *
 * Supabase manda `code` cuando el proyecto usa PKCE y `token_hash` + `type`
 * cuando usa el flujo clasico. Se aceptan los dos: cual llega depende de la
 * configuracion del proyecto, y no merece la pena que un ajuste del panel
 * rompa el acceso.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const origin = publicOrigin(request);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  // Solo rutas internas: un `next` con host propio convertiria el enlace del
  // correo en un redirector abierto hacia donde quisiera quien lo fabrique.
  const raw = searchParams.get("next") ?? "/document";
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/document";

  const supabase = await supabaseServer();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  } else if (tokenHash && type === "magiclink") {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "magiclink" });
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }

  return NextResponse.redirect(new URL("/acceso?estado=caducado", origin));
}
