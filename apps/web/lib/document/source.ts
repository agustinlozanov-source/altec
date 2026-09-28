import "server-only";

import { cache } from "react";
import { loadContent } from "@/lib/access";
import { parseDocument, type ParsedDoc } from "./markdown";

/**
 * Carga y parsea un contenido confidencial.
 *
 * No se lee de un archivo del repositorio: vive en Supabase, en la tabla
 * `documents`, y solo lo devuelve la base a quien tiene el ambito que
 * corresponde. Con el archivo, cualquiera con acceso al codigo lo tenia
 * entero; asi, el permiso lo aplica Postgres.
 *
 * El markdown sigue siendo markdown y el parser es el mismo para los dos
 * documentos: lo unico que cambia es de donde sale el texto. Corregir una
 * cifra ya no exige un despliegue — se edita la fila.
 *
 * `cache` lo deja en una sola consulta por peticion, aunque lo pidan el
 * indice, el cuerpo y los metadatos por separado.
 */
export const loadParsed = cache(async (slug: string): Promise<ParsedDoc | null> => {
  const body = await loadContent(slug);
  return body ? parseDocument(body) : null;
});
