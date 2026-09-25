import { floors } from "../palette";

/**
 * Layout de la oficina (docs/ALTEC-VO.md §8.2): el layout es dato, no codigo.
 *
 * La geometria esta portada de `docs/referencias/oficina-3d.html`. El color
 * NO: el prototipo usaba su propia paleta y aqui todo sale de los tokens de
 * marca via `../palette`.
 *
 * Sistema de coordenadas: plano de 1200 x 720, origen arriba a la izquierda,
 * igual que el prototipo. La escena convierte a coordenadas de mundo; el
 * layout no sabe nada de three.js.
 */

export const PLAN_WIDTH = 1200;
export const PLAN_HEIGHT = 720;

export type Point = readonly [number, number];

export type Door = {
  /** Punto dentro de la sala, pegado al vano. */
  readonly inside: Point;
  /** Nodo de pasillo al que conecta. Sin nodo, la puerta no enruta. */
  readonly node?: string;
  readonly side: "t" | "r" | "b" | "l";
  readonly at: number;
};

export type Spot = {
  readonly id: string;
  readonly room: string;
  readonly at: Point;
  /** Hacia donde mira quien ocupa el lugar. */
  readonly look?: Point;
  readonly kind: "desk" | "seat" | "wait" | "lounge" | "client" | "vacant";
};

export type Room = {
  readonly id: string;
  readonly name: string;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly floor: string;
  readonly doors: readonly Door[];
  /** Muros de cristal en lugar de opacos. */
  readonly glass?: boolean;
  /** La oficina del socio, que lleva luz calida (§8.2). */
  readonly human?: boolean;
  /** El motor de automatizacion, con sus bandas (§8.2). */
  readonly motor?: boolean;
};

export const rooms: readonly Room[] = [
  {
    id: "dir",
    name: "Dirección General",
    x: 20, y: 20, w: 260, h: 200,
    floor: floors.office,
    doors: [{ inside: [262, 110], node: "A1", side: "r", at: 110 }],
  },
  {
    id: "sp",
    name: "Oficina de Partner",
    x: 20, y: 240, w: 260, h: 180,
    floor: floors.office,
    doors: [{ inside: [262, 330], node: "A3", side: "r", at: 330 }],
  },
  {
    id: "lounge",
    name: "Lounge",
    x: 20, y: 440, w: 260, h: 260,
    floor: floors.open,
    doors: [{ inside: [262, 570], node: "A5", side: "r", at: 570 }],
  },
  {
    id: "junta",
    name: "Sala de juntas",
    x: 300, y: 20, w: 400, h: 250,
    floor: floors.meeting,
    glass: true,
    doors: [{ inside: [500, 252], node: "h1a", side: "b", at: 500 }],
  },
  {
    id: "socio",
    name: "Oficina del socio · 20% humano",
    x: 720, y: 20, w: 220, h: 250,
    floor: floors.human,
    human: true,
    doors: [{ inside: [830, 252], node: "h1c", side: "b", at: 830 }],
  },
  {
    id: "lab",
    name: "Laboratorio de análisis",
    x: 960, y: 20, w: 220, h: 300,
    floor: floors.open,
    doors: [{ inside: [978, 170], node: "B1", side: "l", at: 170 }],
  },
  {
    id: "pm",
    name: "Gestión de proyectos",
    x: 960, y: 340, w: 220, h: 180,
    floor: floors.open,
    doors: [{ inside: [978, 430], node: "B3", side: "l", at: 430 }],
  },
  {
    id: "bull",
    name: "Piso de consultoría",
    x: 300, y: 290, w: 640, h: 230,
    floor: floors.open,
    doors: [
      { inside: [620, 308], node: "h1b", side: "t", at: 620 },
      { inside: [620, 502], node: "h2b", side: "b", at: 620 },
    ],
  },
  {
    id: "lobby",
    name: "Recepción de clientes",
    x: 300, y: 540, w: 400, h: 160,
    floor: floors.lobby,
    doors: [
      { inside: [500, 558], node: "h2a", side: "t", at: 500 },
      { inside: [500, 698], side: "b", at: 500 },
    ],
  },
  {
    id: "motor",
    name: "Motor de automatización · 80%",
    x: 720, y: 540, w: 460, h: 160,
    floor: floors.technical,
    motor: true,
    doors: [{ inside: [830, 558], node: "h2c", side: "t", at: 830 }],
  },
] as const;

/** Nodos de la red de pasillos. Los agentes nunca atraviesan paredes (§8.3). */
export const corridorNodes: Readonly<Record<string, Point>> = {
  A1: [290, 110], A2: [290, 280], A3: [290, 330], A4: [290, 530], A5: [290, 570],
  h1a: [500, 280], h1b: [620, 280], h1c: [830, 280],
  B1: [950, 170], B2: [950, 280], B3: [950, 430], B4: [950, 530],
  h2a: [500, 530], h2b: [620, 530], h2c: [830, 530],
};

export const corridorEdges: readonly (readonly [string, string])[] = [
  ["A1", "A2"], ["A2", "A3"], ["A3", "A4"], ["A4", "A5"],
  ["A2", "h1a"], ["h1a", "h1b"], ["h1b", "h1c"], ["h1c", "B2"],
  ["B1", "B2"], ["B2", "B3"], ["B3", "B4"],
  ["A4", "h2a"], ["h2a", "h2b"], ["h2b", "h2c"], ["h2c", "B4"],
];

/** Centro y radios de la mesa ovalada de la sala de juntas. */
export const meetingTable = { center: [500, 150] as Point, rx: 168, ry: 86, seats: 12 };

const meetingSeats: Spot[] = Array.from({ length: meetingTable.seats }, (_, i) => {
  const a = -Math.PI / 2 + (i * Math.PI * 2) / meetingTable.seats;
  return {
    id: `junta.seat-${i}`,
    room: "junta",
    at: [
      meetingTable.center[0] + Math.cos(a) * meetingTable.rx,
      meetingTable.center[1] + Math.sin(a) * meetingTable.ry,
    ] as Point,
    look: meetingTable.center,
    kind: "seat",
  };
});

/** Asientos de espera para los agentes con decision pendiente (§8.2). */
const waitSpots: Spot[] = (
  [
    [785, 172], [875, 172], [830, 190], [790, 230], [870, 230],
  ] as Point[]
).map((at, i) => ({
  id: `socio.wait-${i}`,
  room: "socio",
  at,
  look: [830, 78] as Point,
  kind: "wait",
}));

const loungeSpots: Spot[] = (
  [
    [70, 530], [120, 560], [210, 560], [90, 640], [170, 650],
  ] as Point[]
).map((at, i) => ({ id: `lounge.spot-${i}`, room: "lounge", at, kind: "lounge" }));

const ROW1 = 363;
const ROW2 = 463;

/** Escritorios con dueno. El roster los referencia por id (§6.1, `home`). */
const desks: Spot[] = [
  { id: "dir.desk", room: "dir", at: [150, 112], look: [150, 72], kind: "desk" },
  { id: "sp.desk", room: "sp", at: [150, 330], look: [150, 290], kind: "desk" },
  { id: "pm.desk", room: "pm", at: [1070, 486], look: [1070, 446], kind: "desk" },
  { id: "lab.desk-1", room: "lab", at: [1015, 112], look: [1015, 72], kind: "desk" },
  { id: "lab.desk-2", room: "lab", at: [1125, 112], look: [1125, 72], kind: "desk" },
  { id: "lab.desk-3", room: "lab", at: [1070, 262], look: [1070, 222], kind: "desk" },
  { id: "bull.desk-1", room: "bull", at: [380, ROW1], look: [380, ROW1 - 40], kind: "desk" },
  { id: "bull.desk-2", room: "bull", at: [500, ROW1], look: [500, ROW1 - 40], kind: "desk" },
  { id: "bull.desk-3", room: "bull", at: [620, ROW1], look: [620, ROW1 - 40], kind: "desk" },
  { id: "bull.desk-4", room: "bull", at: [740, ROW1], look: [740, ROW1 - 40], kind: "desk" },
  { id: "bull.desk-5", room: "bull", at: [860, ROW1], look: [860, ROW1 - 40], kind: "desk" },
  { id: "bull.desk-6", room: "bull", at: [380, ROW2], look: [380, ROW2 - 40], kind: "desk" },
  { id: "socio.desk", room: "socio", at: [830, 78], look: [830, 140], kind: "desk" },
];

/**
 * Escritorios vacios translucidos con "+ agente": muestran la capacidad de
 * crecer de la firma (§8.2). No es decoracion, es el argumento comercial.
 */
const vacantDesks: Spot[] = ([500, 620, 740, 860] as number[]).map((x, i) => ({
  id: `bull.free-${i + 1}`,
  room: "bull",
  at: [x, ROW2] as Point,
  look: [x, ROW2 - 40] as Point,
  kind: "vacant",
}));

/** Sillas de visita en los despachos. */
const visitorSeats: Spot[] = [
  { id: "dir.visit-0", room: "dir", at: [115, 165], look: [150, 112], kind: "seat" },
  { id: "dir.visit-1", room: "dir", at: [185, 165], look: [150, 112], kind: "seat" },
  { id: "sp.visit-0", room: "sp", at: [115, 385], look: [150, 330], kind: "seat" },
  { id: "sp.visit-1", room: "sp", at: [185, 385], look: [150, 330], kind: "seat" },
];

const clientSpots: Spot[] = [
  { id: "lobby.client", room: "lobby", at: [410, 634], look: [410, 700], kind: "client" },
];

export const spots: readonly Spot[] = [
  ...desks,
  ...vacantDesks,
  ...meetingSeats,
  ...waitSpots,
  ...loungeSpots,
  ...visitorSeats,
  ...clientSpots,
];

export const roomById = new Map(rooms.map((r) => [r.id, r]));
export const spotById = new Map(spots.map((s) => [s.id, s]));

/** Vistas de camara del panel de control (§8.4). */
export const cameraViews = [
  { id: "general", label: "General", room: null },
  { id: "junta", label: "Sala de juntas", room: "junta" },
  { id: "socio", label: "Oficina del socio", room: "socio" },
  { id: "bull", label: "Consultoría", room: "bull" },
  { id: "motor", label: "Automatización", room: "motor" },
] as const;

export type CameraViewId = (typeof cameraViews)[number]["id"];
