import { altec } from "@altec/ui/tokens";
import { mix } from "./mix";

/**
 * Apariencia de los agentes (docs/ALTEC-VO.md §6.1, campo `look`).
 *
 * La ROPA sale de la paleta de marca: neutros calidos derivados del cream,
 * negro de marca y el verde solo como acento puntual. El prototipo de
 * referencia vestia a los agentes de azul, morado y rojo; eso no se porto.
 *
 * La PIEL y el CABELLO no son colores de marca: son tonos figurativos y se
 * declaran aparte, con variedad, porque son personas y no piezas de interfaz.
 */

const warm = (t: number) => mix(altec.cream, altec.black, t);

/** Ropa: la escala calida de la marca, de lo mas claro a lo mas oscuro. */
export const wear = {
  cream: altec.cream,
  sand: warm(0.2),
  taupe: warm(0.38),
  stone: warm(0.52),
  slate: warm(0.66),
  charcoal: warm(0.8),
  ink: altec.darkGray,
  /** Acento de marca. Se usa con cuentagotas, no en todo el roster. */
  accent: altec.green,
} as const;

export const skinTones = ["#e8bc96", "#d9a57c", "#c68e63", "#a8714d", "#f1c7a1"] as const;
export const hairTones = ["#2b1d16", "#3a2a20", "#1e1511", "#6b3a22", "#8d8d8d", "#cfd8dc"] as const;

export type Look = {
  readonly wear: string;
  readonly accent?: string;
  readonly hair: string;
  readonly skin: string;
  readonly longHair?: boolean;
};
