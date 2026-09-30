"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { checkScope, logAccess } from "@/lib/access";
import { loadAgreement } from "@/lib/acceptance";

/**
 * Registra la aceptacion del convenio.
 *
 * La version se vuelve a calcular aqui, del texto que hay en la base en este
 * momento, y no se toma de lo que mande el formulario: si viniera del cliente,
 * alguien podria firmar una version distinta de la que leyo.
 *
 * El correo tampoco viene del formulario — sale de la sesion. Nadie firma en
 * nombre de otro.
 */
export async function acceptAgreement(
  _previous: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const access = await checkScope("memorandum");
  if (access.state !== "allowed") {
    return { error: "Tu sesión ya no es válida. Vuelve a entrar." };
  }

  const signedName = String(formData.get("signed_name") ?? "").trim();
  if (signedName.length < 5) {
    return { error: "Escribe tu nombre completo." };
  }
  if (formData.get("agreed") !== "on") {
    return { error: "Hace falta marcar la casilla de aceptación." };
  }

  const agreement = await loadAgreement();
  if (!agreement) {
    return { error: "El convenio no está disponible. Avisa a quien te compartió el enlace." };
  }

  const header = await headers();
  const supabase = await supabaseServer();

  // La clausula 12(f) del convenio se compromete a conservar la IP. Detras del
  // proxy de Netlify, la del visitante es la primera de `x-forwarded-for`; la
  // ultima es la del propio proxy.
  const forwarded = header.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? header.get("x-nf-client-connection-ip") ?? null;

  const { error } = await supabase.from("acceptances").insert({
    email: access.email,
    scope: "memorandum",
    version: agreement.version,
    signed_name: signedName,
    company: String(formData.get("company") ?? "").trim() || null,
    phone: String(formData.get("phone") ?? "").trim() || null,
    ip,
    user_agent: header.get("user-agent"),
  });

  // La clave unica salta si esta persona ya firmo esta version. No es un fallo:
  // es que ya estaba hecho, y lo que toca es dejarla pasar.
  if (error && !/duplicate key|unique constraint/i.test(error.message)) {
    console.error("No se pudo registrar la aceptación", error);
    return { error: "No se pudo registrar tu aceptación. Inténtalo de nuevo." };
  }

  await logAccess("memorandum", "open", access.email, `convenio aceptado · ${agreement.version}`);
  redirect("/memorandum");
}
