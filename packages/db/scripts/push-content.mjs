#!/usr/bin/env node
/**
 * Sube el contenido confidencial a Supabase.
 *
 *   pnpm --filter @altec/db push-content
 *
 * Lee los archivos de `apps/web/content` —que no se versionan— y los guarda en
 * la tabla `documents`. Es lo que saca el Documento Maestro y el expediente de
 * Camila del repositorio: a partir de aqui, el archivo local es solo la copia
 * de trabajo y la verdad esta en la base.
 *
 * Se puede correr las veces que haga falta: sobreescribe por `slug`. Para
 * corregir una cifra, edita el archivo y vuelve a correrlo — no hace falta
 * desplegar nada.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { admin, die, repoRoot } from "./lib.mjs";

const PIECES = [
  {
    slug: "documento-maestro",
    title: "Documento Oficial del Holding",
    scope: "document",
    file: "apps/web/content/documento-maestro.md",
  },
  {
    slug: "memorandum",
    title: "Memorándum de Inversión",
    scope: "memorandum",
    file: "apps/web/content/memorandum.md",
  },
  {
    slug: "expediente-camila",
    title: "Expediente confidencial de ALTEC",
    scope: "camila",
    file: "apps/web/content/expediente-camila.md",
  },
];

const supabase = admin();
let pushed = 0;

for (const piece of PIECES) {
  const path = join(repoRoot, piece.file);

  if (!existsSync(path)) {
    console.log(`—  ${piece.slug}: no encontrado en ${piece.file}, se omite`);
    continue;
  }

  const body = readFileSync(path, "utf8").trim();
  if (!body) {
    console.log(`—  ${piece.slug}: el archivo está vacío, se omite`);
    continue;
  }

  const { error } = await supabase.from("documents").upsert(
    {
      slug: piece.slug,
      title: piece.title,
      scope: piece.scope,
      body,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "slug" },
  );

  if (error) die(`No se pudo subir ${piece.slug}: ${error.message}`);

  const lines = body.split("\n").length;
  console.log(`✓  ${piece.slug.padEnd(20)} ${String(lines).padStart(5)} líneas  → ámbito "${piece.scope}"`);
  pushed += 1;
}

if (!pushed) die("No se subió nada. ¿Están los archivos en apps/web/content?");
console.log(`\n${pushed} de ${PIECES.length} piezas en la base.`);
