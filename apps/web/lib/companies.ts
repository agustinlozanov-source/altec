/** Las cinco empresas del grupo (docs/WEB.md §4.1 y §4.3). */
export type Company = {
  key: string;
  name: string;
  industry: string;
  metric: string;
  url: string;
};

export const companies: Company[] = [
  {
    key: "flowhub",
    name: "Flow Hub",
    industry: "Tecnología e Inteligencia Comercial",
    metric: "+40 sistemas · +1,300 automatizaciones · +60 agentes IA",
    url: "https://flowhub.com.mx",
  },
  {
    key: "scalex",
    name: "ScaleX Latam",
    industry: "Consultoría de Escalabilidad",
    metric: "Método propio · Libro publicado · Plataforma con 4 herramientas",
    url: "https://scalexlatam.com",
  },
  {
    key: "avalluo",
    name: "Avalluo / Quantía",
    industry: "Valuación de Activos",
    metric: "+12,000 activos valuados · 32 estados · Tecnología propia",
    url: "https://avalluo.com",
  },
  {
    key: "boston",
    name: "Boston Skilling Center",
    industry: "Educación Ejecutiva (EdTech)",
    metric: "Programas certificados · Alianzas académicas",
    url: "https://bostonskilling.com",
  },
  {
    key: "photocan",
    name: "Photocan",
    industry: "Marketing y Audiovisual",
    metric: "Producción de contenido · Marca y comunicación",
    url: "https://photocan.com.mx",
  },
];
