/**
 * Paleta de ALTEC como valores de JavaScript.
 *
 * Existe porque three.js y la escena 3D no pueden leer utilidades de Tailwind:
 * necesitan el color como dato. Es la MISMA paleta que declara
 * `src/styles/theme.css`, y `scripts/check-tokens.mjs` falla si las dos se
 * separan, asi que sigue habiendo una sola verdad.
 *
 * Para HTML y CSS usa siempre las clases (`bg-altec-green`) o las variables
 * (`var(--altec-green)`). Este archivo es solo para canvas, WebGL y utilidades
 * que calculan color.
 */

export const altec = {
  black: "#000000",
  cream: "#fff0e4",
  green: "#c1ff72",
  darkGray: "#1a1a1a",
  midGray: "#6b6b6b",
  white: "#ffffff",
} as const;

/** Estados de agente en ALTEC VO (docs/ALTEC-VO.md §9.2). */
export const voState = {
  working: "#c1ff72",
  meeting: "#7fa8ff",
  collab: "#c39bff",
  awaiting: "#f5a524",
  idle: "#6b6b6b",
} as const;

/**
 * Escala de series para las graficas del Documento Maestro.
 *
 * Chart.js dibuja sobre un canvas y no puede leer utilidades de Tailwind, asi
 * que necesita el color como dato — el mismo motivo por el que existe este
 * archivo. Arranca en el verde de marca y se abre lo justo para que ocho
 * rebanadas se distingan entre si sobre fondo claro y sobre fondo oscuro.
 *
 * Son rellenos, no texto: el texto de ejes y leyendas se dibuja con
 * `--color-ink`, que ya se adapta al modo.
 */
export const chart = {
  series1: "#c1ff72",
  series2: "#7fa8ff",
  series3: "#c39bff",
  series4: "#f5a524",
  series5: "#5fd3a6",
  series6: "#ff7a8a",
  series7: "#8fe04a",
  series8: "#9aa0a6",
} as const;

/** La misma escala en orden, para pasarsela a Chart.js sin reconstruirla. */
export const chartSeries = [
  chart.series1,
  chart.series2,
  chart.series3,
  chart.series4,
  chart.series5,
  chart.series6,
  chart.series7,
  chart.series8,
] as const;

export type AltecColor = keyof typeof altec;
export type VoStateColor = keyof typeof voState;
