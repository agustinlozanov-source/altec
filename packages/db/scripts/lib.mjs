import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

/** La raiz del monorepo, subiendo desde packages/db/scripts. */
export const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

/**
 * Lee las variables de `apps/web/.env.local`.
 *
 * Los scripts se corren a mano desde una terminal cualquiera, donde no hay
 * nada cargado. Antes que pedir que se exporten tres variables a mano cada
 * vez, se leen de donde ya estan. El archivo no se versiona.
 */
export function loadEnv() {
  const file = join(repoRoot, "apps/web/.env.local");
  if (existsSync(file)) {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (!match) continue;
      const [, key, raw] = match;
      if (process.env[key]) continue;
      process.env[key] = raw.replace(/^["']|["']$/g, "");
    }
  }
}

/** Cliente con la llave de servicio. Se salta RLS: es para administrar. */
export function admin() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.\n" +
        "Ponlas en apps/web/.env.local (no se versiona) y vuelve a intentarlo.",
    );
    process.exit(1);
  }

  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function die(message) {
  console.error(message);
  process.exit(1);
}
