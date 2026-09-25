import { route } from "../routing";
import { spotById, type Point } from "../layouts/default";

/**
 * Modelo de personas en movimiento, portado de
 * `docs/referencias/oficina-3d.html`.
 *
 * Es deliberadamente MUTABLE y vive fuera de React: la posicion cambia en cada
 * cuadro y pasarla por estado de React tiraria la tasa de refresco. React solo
 * monta las figuras; el bucle de la escena las mueve.
 */

export type PersonKind = "agent" | "human" | "visitor";
export type PersonState = "working" | "meeting" | "collab" | "awaiting" | "idle";

export type Person = {
  readonly id: string;
  readonly kind: PersonKind;
  /** Nombre corto, el que se muestra bajo los pies. */
  readonly label: string;
  /** Apariencia: ropa, corbata, pantalon, pelo, piel. */
  readonly look: {
    readonly wear: string;
    readonly accent?: string;
    readonly pants?: string;
    readonly hair: string;
    readonly skin: string;
    readonly longHair?: boolean;
  };

  /** Posicion actual en coordenadas de plano. */
  x: number;
  y: number;
  room: string;
  /** Lugar donde esta sentado, si lo esta. */
  seat: string | null;
  /** Lugar al que pertenece cuando no tiene nada que hacer. */
  readonly home: string;

  /** Camino pendiente. Vacio = quieto. */
  path: Point[];
  destRoom: string | null;
  moving: boolean;
  /** Fase del ciclo de caminado, para el balanceo. */
  phase: number;
  /** Rumbo objetivo y rumbo actual, que lo persigue suavemente. */
  dir: number;
  heading: number;

  state: PersonState;
  task: string;
  /** Globo de dialogo con caducidad, en segundos de reloj de escena. */
  bubble: { text: string; until: number } | null;

  onArrive?: (() => void) | undefined;
};

export function personAtSpot(
  id: string,
  kind: PersonKind,
  label: string,
  look: Person["look"],
  spotId: string,
  state: PersonState = "working",
  task = "",
): Person {
  const spot = spotById.get(spotId);
  const at: Point = spot ? spot.at : [600, 360];
  const dir = spot?.look ? Math.atan2(spot.look[0] - at[0], spot.look[1] - at[1]) : 0;

  return {
    id,
    kind,
    label,
    look,
    x: at[0],
    y: at[1],
    room: spot?.room ?? "bull",
    seat: spotId,
    home: spotId,
    path: [],
    destRoom: null,
    moving: false,
    phase: 0,
    dir,
    heading: dir,
    state,
    task,
    bubble: null,
  };
}

/** Manda a una persona a un lugar. Resuelve cuando llega. */
export function walkToSpot(person: Person, spotId: string): Promise<void> {
  const spot = spotById.get(spotId);
  if (!spot) return Promise.resolve();

  const [tx, ty] = spot.at;
  if (person.room === spot.room && Math.hypot(person.x - tx, person.y - ty) < 1) {
    person.seat = spotId;
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    person.path = route({ room: person.room, at: [person.x, person.y] }, spot.room, spot.at);
    person.destRoom = spot.room;
    person.seat = null;
    person.onArrive = () => {
      person.seat = spotId;
      if (spot.look) person.dir = Math.atan2(spot.look[0] - spot.at[0], spot.look[1] - spot.at[1]);
      resolve();
    };
  });
}

export const walkHome = (person: Person) => walkToSpot(person, person.home);

/**
 * Avanza una persona un cuadro. `dt` en segundos, `speed` en unidades de
 * plano por segundo.
 */
export function stepPerson(person: Person, dt: number, speed: number): void {
  const target = person.path[0];

  if (!target) {
    if (person.moving) {
      person.moving = false;
      const arrive = person.onArrive;
      person.onArrive = undefined;
      arrive?.();
    }
    return;
  }

  person.moving = true;

  const dx = target[0] - person.x;
  const dy = target[1] - person.y;
  const distance = Math.hypot(dx, dy);
  const stride = speed * dt;

  if (distance <= stride) {
    person.x = target[0];
    person.y = target[1];
    person.path.shift();
    if (person.path.length === 0) {
      if (person.destRoom) person.room = person.destRoom;
      person.destRoom = null;
      person.moving = false;
      const arrive = person.onArrive;
      person.onArrive = undefined;
      arrive?.();
    }
    return;
  }

  person.x += (dx / distance) * stride;
  person.y += (dy / distance) * stride;
  person.dir = Math.atan2(dx, dy);
  person.phase += (stride / 26) * Math.PI;
}

/** Dice si la persona deberia estar sentada. */
export function isSitting(person: Person): boolean {
  return !person.moving && person.seat !== null;
}

/** Dice si esta tecleando: sentada en SU escritorio y trabajando. */
export function isTyping(person: Person): boolean {
  return (
    person.kind === "agent" &&
    person.state === "working" &&
    !person.moving &&
    person.seat === person.home
  );
}
