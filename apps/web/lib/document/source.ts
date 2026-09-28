import "server-only";

import { cache } from "react";
import { CONTENT } from "@altec/db";
import { loadContent } from "@/lib/access";
import { parseDocument, type ParsedDoc } from "./markdown";

/**
 * El Documento Maestro.
 *
 * Ya no se lee de un archivo del repositorio: vive en Supabase, en la tabla
 * `documents`, y solo lo devuelve la base de datos a quien tiene el ambito
 * `document`. Con el archivo, cualquiera con acceso al codigo lo tenia entero;
 * asi, el permiso lo aplica Postgres.
 *
 * El markdown sigue siendo markdown y el parser sigue siendo el mismo: lo
 * unico que cambio es de donde sale el texto. Corregir una cifra ya no exige
 * un despliegue — se edita la fila.
 *
 * `cache` lo deja en una sola consulta por peticion, aunque lo pidan el
 * indice, el cuerpo y los metadatos por separado.
 */
export const loadDocument = cache(async (): Promise<ParsedDoc | null> => {
  const body = await loadContent(CONTENT.masterDocument);
  return body ? parseDocument(body) : null;
});
