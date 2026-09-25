import { altec, voState } from "@altec/ui/tokens";

/**
 * Paleta de la escena (docs/ALTEC-VO.md §9.3).
 *
 * Todo se deriva de los tokens de marca: neutros calidos y cream para la
 * oficina, negro en el mobiliario tecnico y el verde de marca como unica luz
 * de acento. El prototipo de referencia usaba otra paleta; de ahi se porto la
 * geometria, no el color.
 */

/** Mezcla dos hex en el espacio sRGB. `t` va de 0 (a) a 1 (b). */
export function mix(a: string, b: string, t: number): string {
  const parse = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [r1, g1, b1] = parse(a) as [number, number, number];
  const [r2, g2, b2] = parse(b) as [number, number, number];
  const ch = (x: number, y: number) =>
    Math.round(x + (y - x) * t)
      .toString(16)
      .padStart(2, "0");
  return `#${ch(r1, r2)}${ch(g1, g2)}${ch(b1, b2)}`;
}

/** Cream oscurecido hacia negro: la familia de neutros calidos de la oficina. */
const warm = (t: number) => mix(altec.cream, altec.black, t);

export const scene = {
  /** Fondo del lienzo: el negro de marca, apenas levantado para dar aire. */
  background: warm(0.94),
  ground: warm(0.9),
  wall: warm(0.78),
  wallTop: warm(0.7),
  glass: altec.cream,
} as const;

/** Pisos por sala. Todos son el mismo cream a distinta profundidad. */
export const floors = {
  /** Despachos: el tono mas claro y calido. */
  office: warm(0.42),
  /** Salas de trabajo colectivo. */
  open: warm(0.52),
  /** Sala de juntas, un punto mas profunda. */
  meeting: warm(0.58),
  /** Oficina del socio: la mas clara, va con la luz calida (§8.2). */
  human: warm(0.3),
  /** Recepcion. */
  lobby: warm(0.36),
  /** Mobiliario tecnico: negro de marca (§9.3). */
  technical: altec.darkGray,
} as const;

export const furniture = {
  desk: warm(0.6),
  deskLegs: warm(0.72),
  chair: warm(0.68),
  table: warm(0.62),
  /** Escritorios vacios con "+ agente" (§8.2). */
  vacant: warm(0.66),
  screenOff: warm(0.8),
  /** Monitores encendidos: verde de marca (§9.3). */
  screenOn: altec.green,
  board: warm(0.74),
} as const;

export const lighting = {
  hemiSky: altec.cream,
  hemiGround: warm(0.82),
  sun: altec.white,
  /** La oficina del socio se distingue por luz calida (§8.2). */
  human: mix(altec.cream, "#ffb547", 0.45),
  /** Acento verde en el motor de automatizacion. */
  accent: altec.green,
} as const;

/** Colores de estado del agente (§9.2). El ambar es de uso exclusivo. */
export const stateColor = voState;

export const brand = altec;
