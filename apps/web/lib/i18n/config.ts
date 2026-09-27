/**
 * Idiomas del sitio (docs/WEB.md §6.2).
 *
 * El inglés es el principal: la audiencia de la ronda es institucional y buena
 * parte no lee español. El español queda como segundo idioma completo, no como
 * traducción parcial.
 */
export const locales = ["en", "es"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

/** Etiqueta corta para el selector de la barra superior. */
export const localeShort: Record<Locale, string> = {
  en: "EN",
  es: "ES",
};

export const localeHtmlLang: Record<Locale, string> = {
  en: "en",
  es: "es-MX",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Cookie donde se recuerda la elección del visitante. */
export const LOCALE_COOKIE = "altec-locale";
