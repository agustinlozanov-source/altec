import { NextResponse } from "next/server";
import { ACCESS_COOKIE, isConfigured, tokenForCode } from "@/lib/camila/access";

export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json(
      { error: "Falta configurar CAMILA_ACCESS_CODE y CAMILA_COOKIE_SECRET." },
      { status: 503 },
    );
  }

  const { code } = (await request.json().catch(() => ({}))) as { code?: string };
  const token = typeof code === "string" ? tokenForCode(code) : null;

  if (!token) {
    return NextResponse.json({ error: "Código incorrecto." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
