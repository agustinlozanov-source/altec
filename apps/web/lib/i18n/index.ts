import { en } from "./dictionaries/en";
import { es } from "./dictionaries/es";
import type { Locale } from "./config";

export type { Dictionary } from "./dictionaries/en";
export * from "./config";

const dictionaries = { en, es } as const;

/** Textos del idioma pedido. El inglés es el respaldo. */
export function getDictionary(locale: Locale) {
  return dictionaries[locale] ?? dictionaries.en;
}

/**
 * Rutas del sitio. Los segmentos son los mismos en los dos idiomas: mantener
 * dos juegos de URLs duplica los enlaces, los redirects y el sitemap sin que
 * nadie lo note.
 */
export const routes = {
  home: "",
  about: "about",
  companies: "companies",
  consulting: "consulting",
  virtualOffice: "virtual-office",
  contact: "contact",
} as const;

/** Arma una ruta con su idioma: `/en/about`. */
export function path(locale: Locale, route: keyof typeof routes): string {
  const segment = routes[route];
  return segment ? `/${locale}/${segment}` : `/${locale}`;
}
