#!/usr/bin/env node
/**
 * Comprueba que el acceso esta bien montado.
 *
 *   pnpm --filter @altec/db doctor
 *
 * Existe para que un fallo de configuracion se vea aqui, en una linea, y no
 * como una pagina en blanco en mitad de una reunion. Revisa lo que suele
 * romperse: una variable mal escrita, la migracion sin aplicar, RLS apagada,
 * o el contenido sin subir.
 */
import { admin, loadEnv } from "./lib.mjs";

loadEnv();

const checks = [];
const ok = (what, detail = "") => checks.push({ ok: true, what, detail });
const bad = (what, detail = "") => checks.push({ ok: false, what, detail });

// --- Variables -------------------------------------------------------------

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (url) ok("NEXT_PUBLIC_SUPABASE_URL", url);
else bad("NEXT_PUBLIC_SUPABASE_URL", "falta");

if (anon) ok("NEXT_PUBLIC_SUPABASE_ANON_KEY");
else bad("NEXT_PUBLIC_SUPABASE_ANON_KEY", "falta");

if (service) ok("SUPABASE_SERVICE_ROLE_KEY");
else bad("SUPABASE_SERVICE_ROLE_KEY", "falta");

// Confundir las dos llaves es el error mas facil de cometer y el mas caro: la
// de servicio se salta RLS, y con prefijo NEXT_PUBLIC_ acabaria en el navegador.
if (anon && service && anon === service) {
  bad("Las dos llaves", "la pública y la de servicio son la misma — revísalas");
}

if (!url || !anon || !service) {
  report();
  process.exit(1);
}

// --- Base de datos ---------------------------------------------------------

const supabase = admin();

for (const table of ["viewers", "documents", "access_log"]) {
  const { error } = await supabase.from(table).select("*", { head: true, count: "exact" });
  if (error) bad(`tabla ${table}`, error.message);
  else ok(`tabla ${table}`);
}

// --- Contenido -------------------------------------------------------------

const { data: docs } = await supabase.from("documents").select("slug, scope, body");
for (const slug of ["documento-maestro", "memorandum", "arquitectura-vo", "convenio-confidencialidad", "expediente-camila"]) {
  const row = docs?.find((d) => d.slug === slug);
  if (row) ok(`contenido ${slug}`, `${row.body.split("\n").length} líneas, ámbito "${row.scope}"`);
  else bad(`contenido ${slug}`, "sin subir — corre push-content");
}

// --- Invitados -------------------------------------------------------------

const { data: viewers } = await supabase.from("viewers").select("email, scopes, revoked_at");
const active = (viewers ?? []).filter((v) => !v.revoked_at);
if (active.length) ok("lista de invitados", `${active.length} con acceso`);
else bad("lista de invitados", "vacía — nadie puede entrar todavía");

// --- RLS: la comprobacion que de verdad importa ----------------------------

// Con la llave publica y sin sesion, `documents` no debe devolver nada. Si
// devuelve algo, el contenido confidencial esta abierto a cualquiera que tenga
// la llave publica, que viaja en cada pagina.
const { createClient } = await import("@supabase/supabase-js");
const anonClient = createClient(url, anon, { auth: { persistSession: false } });
const { data: leaked } = await anonClient.from("documents").select("slug");

if (leaked?.length) bad("RLS en documents", `¡FUGA! la llave pública devuelve ${leaked.length} fila(s)`);
else ok("RLS en documents", "la llave pública sin sesión no devuelve nada");

report();
process.exit(checks.some((c) => !c.ok) ? 1 : 0);

function report() {
  console.log("");
  for (const c of checks) {
    console.log(`${c.ok ? "✓" : "✗"}  ${c.what.padEnd(32)} ${c.detail}`);
  }
  const fails = checks.filter((c) => !c.ok).length;
  console.log("");
  console.log(fails ? `${fails} cosa(s) por arreglar.` : "Todo en orden.");
}
