/**
 * Comprueba que cada visualizacion sigue enganchada a su tabla.
 *
 *   pnpm --filter web run check:docs
 *
 * Las graficas se enganchan por `seccion::encabezados de la tabla` y no por
 * posicion, para que reordenar un documento no cuelgue una grafica de la tabla
 * equivocada. El precio de esa decision es que renombrar una columna hace que
 * la grafica desaparezca en silencio — que es el fallo del lado seguro, pero
 * fallo al fin. Esto lo convierte en un error visible.
 *
 * Los dos registros se comprueban por separado a proposito: los documentos
 * tienen tablas con encabezados identicos, y una clave del Memorandum que
 * casara con el Documento Maestro seria justo el error que se quiere evitar.
 *
 * Se salta si el contenido no esta en disco: vive en Supabase y los archivos
 * locales no se versionan.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseDocument } from "../lib/document/markdown.ts";

const webRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const content = join(webRoot, "content");

function keysOf(file) {
  const doc = parseDocument(readFileSync(join(content, file), "utf8"));
  const out = new Set();
  for (const ch of doc.chapters) {
    for (const b of ch.lead) if (b.kind === "table") out.add(`${ch.key}::${b.signature}`);
    for (const s of ch.sections) for (const b of s.blocks) if (b.kind === "table") out.add(`${s.key}::${b.signature}`);
  }
  return out;
}

const missing = ["documento-maestro.md", "memorandum.md"].filter(
  (f) => !existsSync(join(content, f)),
);
if (missing.length) {
  console.log(`Sin comprobar: falta ${missing.join(", ")} en apps/web/content.`);
  console.log("Se descargan editando la fila en Supabase, o se omiten en un clon limpio.");
  process.exit(0);
}

const src = {
  enh: readFileSync(join(webRoot, "components/document/enhancements.ts"), "utf8"),
  body: readFileSync(join(webRoot, "components/document/document-body.tsx"), "utf8"),
};

function between(text, start, end) {
  const a = text.indexOf(start);
  if (a < 0) return "";
  const b = end ? text.indexOf(end, a) : -1;
  return text.slice(a, b < 0 ? text.length : b);
}

const blocks = {
  maestro: [
    between(src.enh, "export const TABLE_CHARTS", "Memorandum de Inversion"),
    between(src.body, "const TABLE_AS_VISUAL", "function statsFrom"),
    between(src.body, "export const masterRegistry", "export const memorandumRegistry"),
  ].join("\n"),
  memorandum: [
    between(src.enh, "export const MEMO_TABLE_CHARTS", null),
    between(src.body, "export const memorandumRegistry", "export const MEMO_ICONS"),
  ].join("\n"),
};

const docs = { maestro: keysOf("documento-maestro.md"), memorandum: keysOf("memorandum.md") };
let bad = 0;

for (const [name, text] of Object.entries(blocks)) {
  const wired = [...text.matchAll(/"([^"\n]+::[^"\n]+)"/g)].map((m) => m[1]).filter((k) => k.includes("|"));
  const roto = wired.filter((k) => !docs[name].has(k));
  bad += roto.length;
  console.log(`${name.padEnd(12)} ${wired.length - roto.length}/${wired.length} enganchados`);
  for (const k of roto) console.log(`   ✗ ${k} — esa tabla ya no existe con ese encabezado`);
}

if (bad) {
  console.error(`\n${bad} visualización(es) colgando de una tabla que cambió.`);
  process.exit(1);
}
console.log("\nTodas las visualizaciones siguen enganchadas.");
