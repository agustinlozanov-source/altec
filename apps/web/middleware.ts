import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale, locales, LOCALE_COOKIE } from "@/lib/i18n/config";
import { refreshSession } from "@/lib/supabase/middleware";

/**
 * Cada página vive bajo su idioma: `/en/...` y `/es/...`.
 *
 * Quien llega sin idioma en la URL se resuelve en este orden: lo que eligió
 * antes (cookie), lo que pide su navegador, y si nada encaja, inglés.
 *
 * También deja el idioma en una cabecera para que el layout raíz pueda poner
 * el `lang` correcto en el documento sin partirse en dos.
 */

const PUBLIC_FILE = /\.(?:png|jpg|jpeg|svg|webp|ico|txt|xml|webmanifest)$/;

function preferred(request: NextRequest): string {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (saved && isLocale(saved)) return saved;

  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const tag = part.split(";")[0]?.trim().toLowerCase();
    if (!tag) continue;
    const base = tag.split("-")[0];
    if (base && isLocale(base)) return base;
  }

  return defaultLocale;
}

/** Rutas antiguas en español, para no romper enlaces ya compartidos. */
const LEGACY: Record<string, string> = {
  "/nosotros": "about",
  "/contacto": "contact",
  "/oficina-virtual": "virtual-office",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Las rutas de sesión no llevan idioma y no se tocan.
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // El Documento Maestro no vive bajo un idioma: es el texto aprobado por el
  // consejo, en español, y no se traduce. Se queda fuera del redirect y se le
  // marca el idioma a mano para que el `lang` del documento sea correcto. Lo
  // mismo para la pantalla de acceso, que es su puerta.
  if (
    pathname === "/acceso" ||
    pathname === "/document" ||
    pathname === "/memorandum" ||
    pathname.startsWith("/document/")
  ) {
    const response = NextResponse.next();
    response.headers.set("x-altec-locale", "es");
    // Renovar el token aquí y no en la página: escribir cookies solo se puede
    // desde el middleware o una ruta, y un token caducado a mitad de lectura
    // cierra la puerta a quien ya había entrado.
    return refreshSession(request, response);
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (first && isLocale(first)) {
    const response = NextResponse.next();
    response.headers.set("x-altec-locale", first);
    // La consola de Camila también está detrás de sesión, y vive bajo idioma.
    return refreshSession(request, response);
  }

  const locale = preferred(request);

  const legacy = LEGACY[pathname];
  if (legacy) {
    return NextResponse.redirect(new URL(`/${locale}/${legacy}`, request.url));
  }

  return NextResponse.redirect(
    new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url),
  );
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};

export { locales };
