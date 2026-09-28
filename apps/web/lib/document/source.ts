import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { parseDocument, type ParsedDoc } from "./markdown";

/**
 * El Documento Maestro.
 *
 * Vive en `apps/web/content` y no en `public`: es confidencial y no se sirve
 * como archivo estatico. `import "server-only"` lo hace fallar en compilacion
 * si algun dia un componente de cliente lo importa por accidente.
 *
 * `cache` lo deja en una sola lectura y un solo parseo por peticion, aunque
 * lo pidan el indice, el cuerpo y los metadatos por separado.
 */
export const loadDocument = cache(async (): Promise<ParsedDoc> => {
  const file = path.join(process.cwd(), "content", "documento-maestro.md");
  return parseDocument(await readFile(file, "utf8"));
});
