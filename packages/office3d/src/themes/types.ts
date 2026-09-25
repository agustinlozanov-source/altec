/**
 * Tema de la escena (docs/ALTEC-VO.md §2, principio 4: la capa visual es
 * intercambiable).
 *
 * TODO el color y las medidas de la oficina viven aqui. Los componentes solo
 * leen del tema, nunca escriben un color. Cambiar la apariencia de la oficina
 * —o darle a cada empresa del grupo la suya— es escribir otro tema, sin tocar
 * un solo componente.
 *
 * El dashboard que rodea a la escena NO usa esto: ese va siempre con la
 * identidad de ALTEC, desde los tokens de packages/ui.
 */

export type RoomColors = {
  /** Color de piso por sala, indexado por id. */
  readonly floors: Readonly<Record<string, string>>;
  /** Piso de respaldo para salas sin color propio. */
  readonly floorFallback: string;
};

export type WallColors = {
  readonly solid: string;
  /** Muro de la oficina del socio, que se distingue del resto. */
  readonly human: string;
  readonly glass: string;
  readonly glassOpacity: number;
  /** Remate superior del muro. */
  readonly trim: string;
  readonly trimHuman: string;
  readonly trimMotor: string;
  readonly glassTrim: string;
  readonly height: number;
  readonly glassHeight: number;
  readonly thickness: number;
  /** Ancho del vano de puerta. */
  readonly doorWidth: number;
};

export type FurnitureColors = {
  readonly deskTop: string;
  readonly deskLeg: string;
  readonly keyboard: string;
  readonly monitorStand: string;
  readonly monitorBody: string;
  readonly screenOff: string;
  readonly screenOn: string;
  readonly chair: string;
  readonly chairExec: string;
  readonly chairVisitor: string;
  readonly chairBase: string;
  readonly chairPost: string;
  readonly execDesk: string;
  readonly execDeskLeg: string;
  readonly shelf: string;
  readonly books: readonly string[];
  readonly sofa: string;
  readonly loungeTable: string;
  readonly coffeeMachine: string;
  readonly coffeeLight: string;
  readonly meetingTable: string;
  readonly meetingBase: string;
  readonly meetingCarpet: string;
  readonly plantPot: string;
  readonly leafDark: string;
  readonly leafLight: string;
  /** Escritorio vacio con "+ agente". */
  readonly vacant: string;
  readonly vacantOpacity: number;
};

export type BoardColors = {
  readonly idleBackground: string;
  readonly activeBackground: string;
  readonly idleText: string;
  readonly activeText: string;
  readonly accent: string;
};

export type LightingSettings = {
  readonly background: string;
  readonly ground: string;
  readonly slab: string;
  readonly hemiSky: string;
  readonly hemiGround: string;
  readonly hemiIntensity: number;
  readonly ambientIntensity: number;
  readonly sun: string;
  readonly sunIntensity: number;
  readonly sunPosition: readonly [number, number, number];
  /** Luz calida de la oficina del socio. */
  readonly human: string;
  readonly humanIntensity: number;
  /** Luz de acento del motor de automatizacion. */
  readonly accent: string;
  readonly accentIntensity: number;
  /** Tone mapping: "none" da color plano, "aces" lo suaviza. */
  readonly toneMapping: "none" | "aces";
};

export type StateColors = {
  readonly working: string;
  readonly meeting: string;
  readonly collab: string;
  readonly awaiting: string;
  readonly idle: string;
};

/** Ritmos de la escena. Se ajustan sin tocar componentes. */
export type MotionSettings = {
  /** Unidades de plano por segundo al caminar. */
  readonly walkSpeed: number;
  /** Ciclos de balanceo por segundo al caminar. */
  readonly bobRate: number;
  readonly bobHeight: number;
  /** Segundos que tarda la camara en llegar a una vista. */
  readonly cameraEase: number;
  /** Pulso del halo cuando un agente espera decision. */
  readonly awaitingPulseRate: number;
  /** Respiracion sutil en reposo. */
  readonly idleBreathRate: number;
};

export type CharacterSettings = {
  /** Altura total aproximada del personaje, en unidades de plano. */
  readonly height: number;
  readonly ringInner: number;
  readonly ringOuter: number;
  /** "geometry" construye al personaje con primitivas; "gltf" carga modelos. */
  readonly style: "geometry" | "gltf";
};

export type SceneTheme = {
  readonly name: string;
  readonly rooms: RoomColors;
  readonly walls: WallColors;
  readonly furniture: FurnitureColors;
  readonly board: BoardColors;
  readonly lighting: LightingSettings;
  readonly state: StateColors;
  readonly motion: MotionSettings;
  readonly character: CharacterSettings;
};

/** Mezcla dos hex en sRGB. Util para derivar temas. */
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
