import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refresca la sesion en cada peticion.
 *
 * Los tokens de Supabase caducan en una hora. Si nadie los renueva, alguien
 * que deja el documento abierto un rato se encuentra con la puerta cerrada al
 * pasar de seccion. Renovarlos exige escribir cookies, y eso solo se puede
 * hacer desde el middleware o desde una ruta — no desde un Server Component.
 *
 * Devuelve la respuesta con las cookies ya actualizadas: hay que usar ESA y no
 * construir otra, o el token nuevo se pierde por el camino.
 */
export async function refreshSession(
  request: NextRequest,
  response: NextResponse,
): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value, options } of list) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}
