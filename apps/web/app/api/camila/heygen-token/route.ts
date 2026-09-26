import { NextResponse } from "next/server";
import { hasAccess } from "@/lib/camila/access";

/**
 * Token de sesión de HeyGen LiveAvatar.
 *
 * La API key de HeyGen NUNCA llega al navegador: se cambia aquí por un token
 * de sesión de corta vida, que es lo único que viaja al cliente.
 */
export const runtime = "nodejs";

export async function POST() {
  if (!(await hasAccess())) {
    return NextResponse.json({ error: "Sin acceso." }, { status: 401 });
  }

  const apiKey = process.env.HEYGEN_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Falta HEYGEN_API_KEY en el entorno." },
      { status: 503 },
    );
  }

  try {
    const response = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
    });

    if (!response.ok) {
      console.error("[camila] HeyGen devolvió", response.status);
      return NextResponse.json({ error: "HeyGen rechazó la sesión." }, { status: 502 });
    }

    const data = (await response.json()) as { data?: { token?: string } };
    const token = data.data?.token;
    if (!token) {
      return NextResponse.json({ error: "HeyGen no devolvió token." }, { status: 502 });
    }

    return NextResponse.json({
      token,
      avatarId: process.env.HEYGEN_AVATAR_ID ?? null,
      voiceId: process.env.HEYGEN_VOICE_ID ?? null,
    });
  } catch (error) {
    console.error("[camila] fallo al pedir token a HeyGen:", error);
    return NextResponse.json({ error: "No se pudo conectar con HeyGen." }, { status: 502 });
  }
}
