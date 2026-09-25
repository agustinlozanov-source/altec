/** Contenido de la pagina Nosotros (docs/WEB.md §4.2). */

export const timeline = [
  { year: "2018", text: "Se funda Avalluo en Monterrey. Primera empresa del futuro grupo." },
  { year: "2019", text: "Nace Flow Hub como fábrica de software y automatizaciones." },
  { year: "2021", text: "ScaleX Latam lanza su método de escalabilidad para PyMEs." },
  { year: "2023", text: 'Se publica el libro "Método de Escala para PyMEs Latinoamericanas".' },
  { year: "2024", text: "Se crea Boston Skilling Center. Photocan se integra al ecosistema." },
  {
    year: "2026",
    text: "Se constituye ALTEC Group SAPI de CV. Las 5 empresas se integran bajo un holding con sede en CDMX.",
  },
];

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
};

export const founders: TeamMember[] = [
  {
    name: "Agustín Lozano",
    role: "CEO & Founder",
    bio: "Creador de las 5 empresas. Experiencia en consultoría, tecnología y educación ejecutiva. Reubicación a CDMX para dirigir el grupo.",
  },
  {
    name: "Mario Moreno Cortés",
    role: "COO",
    bio: "Cofundador de Flow Hub y Avalluo. Operación y tecnología.",
  },
  {
    name: "Román Cantú",
    role: "CRO / Relaciones con Inversionistas",
    bio: "Red de contactos institucionales. Desarrollo de negocio.",
  },
  {
    name: "Gumaro Bracho",
    role: "Director de Estrategia",
    bio: "Apuesta estratégica del grupo. Visión de largo plazo.",
  },
];

export const governance = [
  {
    key: "OPSP",
    name: "OPSP",
    full: "One Page Strategic Plan",
    text: "Plan estratégico vivo de cada empresa, revisado trimestralmente.",
  },
  {
    key: "launch-gate",
    name: "Launch Gate",
    full: "Sistema de validación de productos",
    text: "12 dimensiones. Nada se vende sin pasar por aquí.",
  },
  {
    key: "forecast",
    name: "Forecast",
    full: "Proyección de capacidad",
    text: "Proyección de equipo, talento y capacidad a 12 meses.",
  },
];
