import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@altec/db";

/**
 * Cliente con la llave de servicio. Se salta RLS entero.
 *
 * Solo para lo que un usuario no puede hacer por si mismo: consultar la
 * bitacora y administrar la lista de invitados. Para leer el contenido NO se
 * usa — ahi el cliente de sesion es mejor, porque deja que las politicas hagan
 * su trabajo en vez de confiar en que el codigo se acuerde de comprobar.
 *
 * `import "server-only"` no es decoracion: si alguien lo importa desde un
 * componente de cliente, el build falla antes de que la llave llegue a un
 * navegador.
 */
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
