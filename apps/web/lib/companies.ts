import type { CompanyKey } from "@altec/ui";

/**
 * Las cinco empresas del grupo (docs/WEB.md §4.1 y §4.3).
 * El nombre y el dominio no se traducen; el sector y la tracción viven en el
 * diccionario, en `lib/i18n`.
 */
export type Company = {
  /** Tiene que existir en CompanyLogo: si no, no compila. */
  key: CompanyKey;
  name: string;
  url: string;
};

export const companies: Company[] = [
  { key: "flowhub", name: "Flow Hub", url: "https://flowhub.com.mx" },
  { key: "scalex", name: "ScaleX Latam", url: "https://scalexlatam.com" },
  { key: "avalluo", name: "Avalluo / Quantía", url: "https://avalluo.com" },
  { key: "boston", name: "Boston Skilling Center", url: "https://bostonskilling.com" },
  { key: "photocan", name: "Photocan", url: "https://photocan.com.mx" },
];
