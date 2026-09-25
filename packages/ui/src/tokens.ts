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

export type AltecColor = keyof typeof altec;
export type VoStateColor = keyof typeof voState;
