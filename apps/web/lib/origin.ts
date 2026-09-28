import type { NextRequest } from "next/server";

/**
 * El dominio publico del sitio.
 *
 * No se usa `request.nextUrl.origin` porque dentro de una funcion de Netlify
 * reporta el dominio del deploy de rama (`main--sitio.netlify.app`) y no aquel
 * por el que entro la visita. Redirigir ahi despues de iniciar sesion tira la
 * sesion por la borda: las cookies se pusieron para un host y el redirect lleva
 * a otro, asi que el navegador no las manda y la puerta vuelve a estar cerrada
 * como si el enlace no hubiera funcionado.
 *
 * El orden es: lo que diga la configuracion, lo que diga el proxy, y ya en
 * ultimo lugar lo que crea la peticion.
 */
export function publicOrigin(request: NextRequest, headers?: Headers): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");

  const source = headers ?? request.headers;
  const host = source.get("x-forwarded-host") ?? source.get("host");
  if (host) {
    const proto = source.get("x-forwarded-proto") ?? "https";
    return `${proto}://${host}`;
  }

  return request.nextUrl.origin;
}
