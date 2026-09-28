import { NextResponse } from "next/server";
import { ACCESS_COOKIE, tokenForCode } from "@/lib/document/access";

/**
 * Canjea el codigo de acceso por una cookie.
 *
 * La cookie es `httpOnly`: el token no lo ve el JavaScript de la pagina, solo
 * viaja en la peticion. Dura un dia — lo suficiente para una sesion de trabajo
 * con el documento, no tanto como para quedarse abierta en un equipo prestado.
 */
export async function POST(request: Request) {
  let code: string;
  try {
    const body = (await request.json()) as { code?: unknown };
    code = typeof body.code === "string" ? body.code.trim() : "";
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const token = code ? tokenForCode(code) : null;
  if (!token) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return response;
}
