import "server-only";

import { cache } from "react";
import { CONTENT, type Scope } from "@altec/db";
import { isConfigured, supabaseServer } from "@/lib/supabase/server";

/**
 * La puerta.
 *
 * Sustituye al codigo compartido que habia antes. Un codigo compartido no
 * dice quien entro, y no se le puede quitar a una sola persona sin cambiarselo
 * a todas. Aqui cada quien entra con su correo, queda registrado, y revocarle
 * el acceso a uno no toca a los demas.
 */

export type Access =
  /** Faltan las variables de Supabase: la puerta no existe todavia. */
  | { state: "unconfigured" }
  /** Nadie ha iniciado sesion. */
  | { state: "anonymous" }
  /** Sesion valida, pero esa persona no tiene este ambito. */
  | { state: "denied"; email: string }
  | { state: "allowed"; email: string };

/**
 * `cache` porque una misma peticion pregunta varias veces —la pagina, los
 * metadatos, la bitacora— y no tiene sentido ir a la base de datos en cada
 * una.
 */
export const checkScope = cache(async (scope: Scope): Promise<Access> => {
  if (!isConfigured()) return { state: "unconfigured" };

  const supabase = await supabaseServer();

  // `getUser` y no `getSession`: el segundo se fia de la cookie tal cual, y la
  // cookie la manda el navegador. `getUser` valida el token contra Supabase.
  const { data, error } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  if (error || !email) return { state: "anonymous" };

  // Quien decide es Postgres, no este archivo.
  const { data: allowed } = await supabase.rpc("has_scope", { target: scope });

  return allowed === true ? { state: "allowed", email } : { state: "denied", email };
});

/** Deja constancia. Nunca hace fallar la pagina: la bitacora no vale una caida. */
export async function logAccess(
  scope: Scope,
  action: "open" | "denied",
  email: string,
  detail?: string,
): Promise<void> {
  try {
    const supabase = await supabaseServer();
    await supabase.from("access_log").insert({ email, scope, action, detail: detail ?? null });
  } catch (error) {
    console.error("No se pudo registrar el acceso", error);
  }
}

/**
 * Lee un contenido confidencial.
 *
 * No lleva comprobacion de permisos porque no le hace falta: la politica RLS
 * de `documents` solo devuelve filas cuyo ambito tenga quien pregunta. Si
 * alguien llama a esto sin permiso, recibe `null`, no una fuga.
 */
export async function loadContent(slug: string): Promise<string | null> {
  const supabase = await supabaseServer();
  const { data } = await supabase.from("documents").select("body").eq("slug", slug).maybeSingle();
  return data?.body ?? null;
}

export { CONTENT };
