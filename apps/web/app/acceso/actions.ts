"use server";

import { headers } from "next/headers";
import { isConfigured, supabaseServer } from "@/lib/supabase/server";

/**
 * Manda el enlace de acceso.
 *
 * `shouldCreateUser: false` es la pieza importante: sin eso, Supabase daria de
 * alta a cualquiera que escriba un correo y le mandaria un enlace. Con eso,
 * solo reciben enlace las personas que ya estan invitadas — a las demas no les
 * llega nada.
 *
 * La respuesta es la misma escriba quien escriba. Decir "ese correo no esta en
 * la lista" convertiria el formulario en una forma de averiguar quienes son
 * los inversionistas de ALTEC.
 */
export async function sendLink(
  _previous: { sent: boolean; error: string | null },
  formData: FormData,
): Promise<{ sent: boolean; error: string | null }> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email || !email.includes("@")) {
    return { sent: false, error: "Escribe un correo válido." };
  }

  if (!isConfigured()) {
    return { sent: false, error: "El acceso todavía no está configurado en este entorno." };
  }

  const next = String(formData.get("next") ?? "/document");
  const header = await headers();
  // Mismo criterio que el callback: detras del proxy de Netlify, `host` puede
  // ser el dominio del deploy de rama.
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    `${header.get("x-forwarded-proto") ?? "https"}://${header.get("x-forwarded-host") ?? header.get("host")}`;

  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    // Un correo que no esta invitado tambien cae aqui. No se distingue.
    console.warn("Enlace de acceso no enviado:", error.message);
  }

  return { sent: true, error: null };
}
