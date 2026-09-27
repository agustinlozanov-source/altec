/**
 * Configuración del sitio. El dominio definitivo está pendiente
 * (docs/WEB.md §1), por eso la URL base sale de variable de entorno.
 *
 * Los textos traducibles NO viven aquí: están en `lib/i18n`.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const site = {
  name: "ALTEC Group",
  legalName: "ALTEC GROUP SAPI de CV",
  address: "Reforma 445, CDMX, México",
  email: "contacto@altec.mx",
  investorPortalUrl: "https://docs.altec.mx",
} as const;
