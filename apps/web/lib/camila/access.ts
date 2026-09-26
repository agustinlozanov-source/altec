import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Puerta de acceso a Camila.
 *
 * No es decoracion: su contexto lleva el cap table, el punto de equilibrio y
 * el monto de la ronda, y cada pregunta gasta credito de la API. Sin puerta,
 * cualquiera que diera con la URL podria preguntarle por el cap table o
 * vaciar el saldo.
 *
 * Es un codigo compartido, proporcionado a una demo interna. Para el portal
 * del inversionista hace falta autenticacion de verdad (docs/WEB.md §5.1).
 */

const COOKIE = "camila-access";

function expectedToken(): string | null {
  const code = process.env.CAMILA_ACCESS_CODE;
  const secret = process.env.CAMILA_COOKIE_SECRET;
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
  const real = process.env.CAMILA_ACCESS_CODE;
  if (!expected || !real) return null;
  return safeEqual(code, real) ? expected : null;
}

export const ACCESS_COOKIE = COOKIE;
