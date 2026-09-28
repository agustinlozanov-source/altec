import type { ChartSpec } from "./chart";

/**
 * Que grafica acompaña a que tabla.
 *
 * La clave es `clave de seccion :: encabezados de la tabla`. Se engancha por
 * el contenido del encabezado y no por la posicion a proposito: si alguien
 * reordena el documento, una grafica no puede acabar colgada de la tabla
 * equivocada. Como mucho deja de aparecer, que es el fallo del lado seguro.
 *
 * Las tablas siguen estando: la grafica se añade, no sustituye a la cifra.
 */

export type ChartEntry = { spec: ChartSpec; caption: string; height?: number };

export const TABLE_CHARTS: Record<string, ChartEntry> = {
  "2.1::Tamaño | Empleados | Cantidad | % del total | ¿Es cliente ALTEC?": {
    spec: {
      type: "doughnut",
      labels: ["Micro", "Pequeña (baja)", "Pequeña (alta)", "Mediana", "Grande"],
      values: [95.4, 2.6, 1.2, 0.7, 0.2],
      unit: "percent",
      colors: [7, 3, 1, 0, 2],
      highlight: [2, 3],
    },
    caption: "El core target son las dos rebanadas resaltadas: ~104,000 empresas del 1.9%.",
    height: 300,
  },

  "2.3::Industria | % del mercado global | Gasto como % del revenue | Intensidad": {
    spec: {
      type: "bar",
      horizontal: true,
      labels: [
        "Servicios Financieros",
        "Tecnología",
        "Healthcare / Life Sciences",
        "Energía y Utilities",
        "Gobierno / Sector Público",
        "Manufactura / Industrial",
        "Consumer / Retail",
        "Construcción / Real Estate",
      ],
      values: [23, 22.5, 15, 9, 9, 9, 6, 4],
      unit: "percent",
      ramp: true,
    },
    caption:
      "Punto medio de cada rango de la tabla. Los valores exactos, con su rango, están arriba.",
    height: 340,
  },

  "2.4::Prioridad | Industria | Empresas target | Gasto consultoría | Velocidad conversión | Fit ALTEC":
    {
      spec: {
        type: "bar",
        horizontal: true,
        labels: [
          "1 · Healthcare",
          "2 · Tech / SaaS",
          "3 · Fintech",
          "4 · Automotriz T2-3",
          "5 · Comercio / Retail",
          "6 · Logística",
          "7 · Manufactura Alimentos",
        ],
        values: [3000, 2250, 2000, 2500, 10000, 4000, 4000],
        unit: "count",
        ramp: true,
      },
      caption:
        "Empresas target — punto medio de cada rango. La intensidad del color sigue la prioridad, no el tamaño: Comercio es el universo más grande y aun así es la quinta prioridad.",
      height: 320,
    },

  "7.2::Socio | Participación | Rol": {
    spec: {
      type: "doughnut",
      labels: [
        "Inversionista(s)",
        "Agustín Lozano",
        "Mario Moreno Cortés",
        "Román Cantú",
        "Gumaro Bracho",
        "Pool empleados (Serie B)",
      ],
      values: [25, 25, 18, 12, 10, 10],
      unit: "percent",
      colors: [0, 1, 2, 3, 4, 7],
    },
    caption: "Cap table al cierre de la ronda. Participación base, antes de vesting de desempeño.",
    height: 300,
  },

  "8.4::Pilar | Porcentaje | Monto (MXN)": {
    spec: {
      type: "doughnut",
      labels: ["Talento", "Renta", "Marketing", "Legal"],
      values: [1818600, 812000, 480000, 489400],
      unit: "mxn",
      colors: [0, 1, 2, 3],
    },
    caption: "Destino de los $3,600,000 MXN de la ronda.",
    height: 300,
  },

  "8.6::Línea | Métrica | Revenue Año 1": {
    spec: {
      type: "doughnut",
      labels: [
        "Proyectos de consultoría",
        "Eventos educativos",
        "Diagnósticos DX21",
        "ALTEC VO (MRR)",
      ],
      values: [1000000, 585000, 250000, 144000],
      unit: "usd",
      colors: [0, 1, 2, 3],
    },
    caption: "Revenue Año 1 de ALTEC consultora, por línea de negocio.",
    height: 300,
  },

  "8.6::Línea de servicio | Proyección Año 1 (MXN)": {
    spec: {
      type: "bar",
      labels: ["ALTEC Consulting", "ALTEC Technology", "Avalluo", "ALTEC Academy", "ALTEC Media"],
      values: [6500000, 6510000, 5520000, 5520000, 2580000],
      unit: "mxn",
      colors: [0, 1, 2, 3, 4],
    },
    caption: "Facturación consolidada del grupo en el Año 1: $26,630,000 MXN.",
    height: 300,
  },

  "8.7::Periodo | Empresas transformadas | Acumulado": {
    spec: {
      type: "line",
      labels: ["Años 1-5", "Años 6-10", "Años 11-15", "Años 16-20"],
      values: [450, 1200, 2100, 3000],
      unit: "count",
      area: true,
      goal: { value: 3000, label: "Meta BHAG" },
    },
    caption: "Empresas transformadas, acumulado. La línea punteada es el BHAG: 3,000 a 20 años.",
    height: 300,
  },
};

/** Las etapas del embudo, tal como las da la tabla de 6.1. */
export const FUNNEL_STAGES = [
  { label: "Invitaciones enviadas", value: 500, display: "500" },
  { label: "Asistentes al evento", value: 35, display: "30-40", rate: "6-8% de respuesta" },
  { label: "Interesados en diagnóstico", value: 10, display: "8-12", rate: "25-35% de asistentes" },
  { label: "Diagnósticos realizados", value: 6.5, display: "5-8", rate: "60-70% del interesado" },
  { label: "Proyectos de consultoría", value: 2.5, display: "2-3", rate: "35-50% de diagnosticados" },
  { label: "Clientes recurrentes (VO)", value: 1.5, display: "1-2", rate: "50-70% de proyectos" },
];

/* --------------------------------------------------------------------------
 * Memorandum de Inversion
 *
 * Registro aparte del Documento Maestro a proposito. Los dos tienen tablas con
 * encabezados parecidos —"Concepto | Valor" aparece en ambos— y una sola tabla
 * de claves acabaria colgando la grafica de un documento en el otro.
 * ----------------------------------------------------------------------- */

export const MEMO_TABLE_CHARTS: Record<string, ChartEntry> = {
  "3.2::Instrumento | Rendimiento anual": {
    spec: {
      type: "bar",
      horizontal: true,
      labels: [
        "CETES 28 días",
        "Bolsa Mexicana (IPC)",
        "Bienes raíces (CDMX)",
        "Fondos diversificados",
        "ALTEC (proyectada)",
      ],
      values: [11, 10, 6, 12.5, 184.5],
      unit: "percent",
      colors: [7, 7, 7, 7, 0],
      highlight: [4],
    },
    caption:
      "La de ALTEC es una proyección; las demás son rendimientos observados. La advertencia de arriba aplica.",
    height: 260,
  },

  "3.3::Escenario | Revenue Año 2 | Múltiplo | Valuación | Valor del 25% | MOIC | TIR": {
    spec: {
      type: "bar",
      labels: ["Conservador (70%)", "Base (100%)", "Optimista (130%)"],
      values: [4.7, 8.1, 13.6],
      unit: "count",
      colors: [7, 0, 1],
    },
    caption: "MOIC por escenario — cuántas veces se multiplica el capital a 24 meses.",
    height: 260,
  },

  "4.2::Línea de ingreso | Métrica de cálculo | Revenue Año 1": {
    spec: {
      type: "doughnut",
      labels: [
        "Proyectos de consultoría",
        "Eventos educativos",
        "Diagnósticos DX21",
        "ALTEC VO (MRR)",
      ],
      values: [1000000, 585000, 250000, 144000],
      unit: "usd",
      colors: [0, 1, 2, 3],
    },
    caption: "Revenue Año 1 de ALTEC consultora, por línea de ingreso.",
    height: 300,
  },

  "cap-5::Categoría | % | Monto (MXN) | Descripción": {
    spec: {
      type: "doughnut",
      labels: ["Talento", "Renta", "Marketing", "Legal"],
      values: [1818600, 812000, 480000, 489400],
      unit: "mxn",
      colors: [0, 1, 2, 3],
    },
    caption: "Destino de los $3,600,000 MXN en 12 meses.",
    height: 300,
  },

  "cap-7::Socio | Participación | Rol": {
    spec: {
      type: "doughnut",
      labels: [
        "Inversionista(s)",
        "Agustín Lozano",
        "Mario Moreno Cortés",
        "Román Cantú",
        "Gumaro Bracho",
        "Pool Serie B",
      ],
      values: [25, 25, 18, 12, 10, 10],
      unit: "percent",
      colors: [0, 1, 2, 3, 4, 7],
    },
    caption: "Cap table al cierre de la ronda.",
    height: 300,
  },
};
