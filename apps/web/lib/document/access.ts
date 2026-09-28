import "server-only";

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Puerta de acceso al Documento Maestro.
 *
 * El documento lo dice en su primera linea: la distribucion esta restringida a
 * socios accionistas e inversionistas autorizados. Dentro van el cap table, la
 * valuacion, los salarios por nivel y la justificacion de participacion socio
 * por socio. Sin puerta, cualquiera con la URL lo tendria entero.
 *
 * Es un codigo compartido — el mismo mecanismo que la consola de Camila. Para
 * el portal del inversionista de verdad hace falta autenticacion por persona,
 * de forma que se pueda saber quien vio que y revocar un acceso concreto
 * (docs/WEB.md §5.1).
 */

const COOKIE = "altec-doc-access";

function expectedToken(): string | null {
  const code = process.env.DOC_ACCESS_CODE;
  const secret = process.env.DOC_COOKIE_SECRET;
  if (!code || !secret) return null;
  return createHmac("sha256", secret).update(code).digest("hex");
}

/** Compara sin filtrar informacion por el tiempo que tarda. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export function isConfigured(): boolean {
  return expectedToken() !== null;
}

export async function hasAccess(): Promise<boolean> {
  const token = expectedToken();
  if (!token) return false;
  const jar = await cookies();
  const value = jar.get(COOKIE)?.value;
  return Boolean(value && safeEqual(value, token));
}

/** Devuelve la cookie a poner si el codigo es correcto, o null. */
export function tokenForCode(code: string): string | null {
  const expected = expectedToken();
  const real = process.env.DOC_ACCESS_CODE;
  if (!expected || !real) return null;
  return safeEqual(code, real) ? expected : null;
}

export const ACCESS_COOKIE = COOKIE;
