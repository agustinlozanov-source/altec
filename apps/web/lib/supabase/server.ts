import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@altec/db";

/**
 * Cliente de Supabase atado a la sesion de quien esta pidiendo la pagina.
 *
 * Usa la llave publica, que no da ningun privilegio por si misma: lo que
 * decide que puede leer esta persona son las politicas RLS mas el correo que
 * viaja en su token. Es decir, la comprobacion de acceso la hace Postgres, no
 * un `if` en JavaScript que alguien pueda olvidarse de escribir.
 */
export async function supabaseServer() {
  const jar = await cookies();

  return createServerClient<Database>(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (list) => {
          try {
            for (const { name, value, options } of list) jar.set(name, value, options);
          } catch {
            // Desde un Server Component no se pueden escribir cookies. No pasa
            // nada: el middleware ya refresco la sesion antes de llegar aqui.
          }
        },
      },
    },
  );
}

export function isConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}
