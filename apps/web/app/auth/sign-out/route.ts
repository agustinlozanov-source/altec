import { NextResponse, type NextRequest } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { publicOrigin } from "@/lib/origin";

/**
 * Cerrar sesion es POST y no GET a proposito: un GET lo dispara cualquier
 * imagen o enlace de otra pagina, y nadie quiere que le cierren la sesion por
 * abrir un correo.
 */
export async function POST(request: NextRequest) {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/acceso", publicOrigin(request)), { status: 303 });
}
