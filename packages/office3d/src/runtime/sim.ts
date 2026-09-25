import type { Person } from "./people";

/**
 * Nucleo de la simulacion, portado de `docs/referencias/oficina-3d.html`.
 *
 * Lleva el reloj de la jornada, la pausa y la velocidad, los temporizadores
 * del guion, la bandeja de decisiones, la bitacora, los clientes y los cubos
 * del motor de automatizacion.
 *
 * Es mutable a proposito: el guion es codigo asincrono que espera (`sleep`) y
 * la escena lee el estado en cada cuadro. React se entera por `subscribe`, que
 * solo avisa cuando cambia algo discreto.
 */

export const MINUTES_PER_SECOND = 1.5;
export const DAY_START_MINUTE = 8 * 60 + 50;
export const WALK_SPEED = 120;

export const stateLabels = {
  working: "Trabajando",
  meeting: "En reunión",
  collab: "Colaborando",
  awaiting: "Espera tu decisión",
  idle: "En pausa",
} as const;

export type DecisionRequest = {
  title: string;
  amount?: string;
  ask: string;
  bullets: string[];
};

export type Decision = DecisionRequest & {
  id: number;
  agentId: string;
  agentName: string;
  at: number;
  resolve: (outcome: "approve" | "changes") => void;
};

export type FeedEntry = {
  id: number;
  time: string;
  who: string | null;
  color: string;
  text: string;
  kind: string;
};

export type Client = {
  name: string;
  service: string;
  stage: string;
  progress: number;
  contact?: string;
};

export type QueueItem = { text: string; status: "hecho" | "en curso" | "pendiente" | "espera" };

/** Estado por agente que el guion va moviendo. */
export type AgentWork = {
  queue: QueueItem[];
  done: number;
  automated: number;
  /** Ocupado por un hilo del guion; el ambiental no lo toca. */
  busy: symbol | null;
  inAmbient: boolean;
  nextAmbient: number;
  /** Banda del motor por la que salen sus cubos. */
  lane: number;
};

export type Chip = { x: number; lane: number; color: string; agentId: string };

const DAY_NAMES = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] as const;

export class Simulation {
  time = 0;
  speed = 1;
  paused = false;
  day = 0;
  dayStart = 0;

  automatedTasks = 0;
  automatedMinutes = 0;
  humanMinutes = 0;
  meetingTitle = "";

  readonly people: Person[];
  readonly work = new Map<string, AgentWork>();

  inbox: Decision[] = [];
  feed: FeedEntry[] = [];
  clients: Client[] = [];
  chips: Chip[] = [];

  /** Aprueba sola las decisiones tras 9 s, para que la demo corra sin manos. */
  autoApprove = false;

  /** Sala a la que la camara deberia mirar; la escena la obedece si procede. */
  focusRequest: string | null = null;
  focusUntil = 0;

  private timers: { at: number; resolve: () => void }[] = [];
  private listeners = new Set<() => void>();
  private nextId = 1;
  private version = 0;

  constructor(people: Person[]) {
    this.people = people;
  }

  // --- suscripcion para React ---------------------------------------------

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getVersion = () => this.version;

  /** Avisa a React. Se llama solo cuando cambia algo que se ve en el panel. */
  notify() {
    this.version += 1;
    for (const listener of this.listeners) listener();
  }

  // --- controles de la demo ------------------------------------------------

  togglePause() {
    this.paused = !this.paused;
    this.notify();
  }

  setSpeed(speed: number) {
    this.speed = speed;
    this.notify();
  }

  setAutoApprove(value: boolean) {
    this.autoApprove = value;
    this.notify();
  }

  // --- reloj ---------------------------------------------------------------

  clockMinutes(): number {
    return DAY_START_MINUTE + Math.floor((this.time - this.dayStart) * MINUTES_PER_SECOND);
  }

  clock(): string {
    const m = this.clockMinutes();
    return `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
  }

  dayName(): string {
    return DAY_NAMES[(this.day - 1 + DAY_NAMES.length) % DAY_NAMES.length] ?? "Lunes";
  }

  /** Espera segundos de simulacion. Respeta pausa y velocidad. */
  sleep(seconds: number): Promise<void> {
    return new Promise((resolve) => {
      this.timers.push({ at: this.time + seconds, resolve });
    });
  }

  // --- bitacora, clientes, decisiones --------------------------------------

  log(person: Person | null, text: string, kind = "") {
    this.feed.unshift({
      id: this.nextId++,
      time: this.clock(),
      who: person ? person.label : null,
      color: person ? (person.kind === "human" ? "#f5a524" : person.look.wear) : "#5f8185",
      text,
      kind,
    });
    if (this.feed.length > 80) this.feed.pop();
    this.notify();
  }

  setClient(client: Client, stage: string, progress: number) {
    client.stage = stage;
    client.progress = progress;
    this.notify();
  }

  workOf(person: Person): AgentWork {
    let w = this.work.get(person.id);
    if (!w) {
      w = { queue: [], done: 0, automated: 0, busy: null, inAmbient: false, nextAmbient: 0, lane: 0 };
      this.work.set(person.id, w);
    }
    return w;
  }

  /** Cubos que salen por la banda del motor de automatizacion. */
  burst(person: Person, count: number) {
    const lane = this.workOf(person).lane;
    for (let i = 0; i < count; i += 1) {
      this.chips.push({ x: 745 - i * 22, lane, color: person.look.wear, agentId: person.id });
    }
  }

  /** Avanza la simulacion un cuadro. `dt` en segundos reales. */
  step(dt: number, onStepPerson: (person: Person, delta: number) => void) {
    if (this.paused) return;
    const d = dt * this.speed;
    this.time += d;

    for (let i = this.timers.length - 1; i >= 0; i -= 1) {
      const timer = this.timers[i];
      if (timer && timer.at <= this.time) {
        this.timers.splice(i, 1);
        timer.resolve();
      }
    }

    for (const person of this.people) onStepPerson(person, d);

    // Los agentes que trabajan en su lugar van soltando tareas automatizadas.
    for (const person of this.people) {
      if (person.kind !== "agent") continue;
      if (person.state === "working" && !person.moving && Math.random() < 0.11 * d) {
        this.chips.push({
          x: 745,
          lane: this.workOf(person).lane,
          color: person.look.wear,
          agentId: person.id,
        });
      }
    }

    for (let i = this.chips.length - 1; i >= 0; i -= 1) {
      const chip = this.chips[i];
      if (!chip) continue;
      chip.x += 150 * d;
      if (chip.x > 1158) {
        this.chips.splice(i, 1);
        this.automatedTasks += 1;
        this.automatedMinutes += 2.5;
        const w = this.work.get(chip.agentId);
        if (w) w.automated += 1;
      }
    }

    for (const person of this.people) {
      if (person.bubble && person.bubble.until < this.time) person.bubble = null;
    }

    if (this.autoApprove) {
      for (const decision of [...this.inbox]) {
        if (this.time - decision.at > 9) decision.resolve("approve");
      }
    }
  }

  reset() {
    this.timers = [];
    this.inbox = [];
    this.feed = [];
    this.chips = [];
  }
}
