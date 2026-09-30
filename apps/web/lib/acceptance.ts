import "server-only";

import { createHash } from "node:crypto";
import { cache } from "react";
import { CONTENT, type Scope } from "@altec/db";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

/**
 * El convenio de confidencialidad que se firma antes de leer.
 *
 * La version es el hash del propio texto. Asi no hay que acordarse de subirla
 * a mano: si alguien corrige una coma del convenio, la version cambia sola y a
 * todo el mundo se le vuelve a pedir la firma. Un "acepto" contra un texto que
 * ya no existe no vale nada.
 */

/** Ocho caracteres bastan para distinguir versiones y caben en un renglon. */
export function versionOf(text: string): string {
  return createHash("sha256").update(text.trim()).digest("hex").slice(0, 8);
}

/**
 * El texto del convenio.
 *
 * Se lee con la llave de servicio y no con la de sesion a proposito: es un
 * contrato que la persona tiene que poder leer ANTES de aceptarlo, y no seria
 * razonable esconderlo detras de la puerta que el mismo abre. No es
 * informacion confidencial — es lo que se compromete a guardar.
 */
export const loadAgreement = cache(async (): Promise<{ text: string; version: string } | null> => {
  const { data } = await supabaseAdmin()
    .from("documents")
    .select("body")
    .eq("slug", CONTENT.confidentiality)
    .maybeSingle();

  if (!data?.body) return null;
  return { text: data.body, version: versionOf(data.body) };
});

/** ¿Ya firmó esta persona esta versión, para este ámbito? */
export async function hasAccepted(
  email: string,
  scope: Scope,
  version: string,
): Promise<boolean> {
  const supabase = await supabaseServer();
  const { data } = await supabase
    .from("acceptances")
    .select("id")
    .eq("email", email)
    .eq("scope", scope)
    .eq("version", version)
    .maybeSingle();
  return Boolean(data);
}
