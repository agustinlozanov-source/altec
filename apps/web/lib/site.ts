/**
 * Configuracion del sitio. El dominio definitivo esta pendiente
 * (docs/WEB.md §1), por eso la URL base sale de variable de entorno.
 */
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const site = {
  name: "ALTEC Group",
  legalName: "ALTEC GROUP SAPI de CV",
  tagline: "Advisory · Learning · Technology",
  address: "Reforma 445, CDMX, México",
  email: "contacto@altec.mx",
  investorPortalUrl: "https://docs.altec.mx",
} as const;

export const nav = [
  { label: "Home", href: "/" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Empresas", href: "/empresas" },
  { label: "Consultoría", href: "/consultoria" },
  { label: "Contacto", href: "/contacto" },
] as const;

/** Fase 1 solo publica Home, Nosotros y Contacto (docs/WEB.md §8). */
export const phaseOneRoutes = new Set(["/", "/nosotros", "/contacto"]);
