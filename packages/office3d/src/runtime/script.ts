import { roster } from "@altec/agents";
import { spotById, spots } from "../layouts/default";
import {
  personAtSpot,
  walkHome,
  walkToPoint,
  walkToSpot,
  type Person,
  type PersonState,
} from "./people";
import type { Client, DecisionRequest, Simulation } from "./sim";

/**
 * El dia de trabajo, portado linea por linea de
 * `docs/referencias/oficina-3d.html`: standup, llegada de un prospecto,
 * kickoff, plan de trabajo, propuesta con aprobacion humana, consejo BOARDx y
 * evaluacion TEAMx. Se repite en bucle.
 */

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)] as T;

const LEAD_POOL = [
  { name: "Ferretera del Norte", contact: "Lic. Garza" },
  { name: "Lácteos San Isidro", contact: "Ing. Robles" },
  { name: "Transportes Cumbres", contact: "C.P. Ayala" },
  { name: "Muebles Arteaga", contact: "Sra. Arteaga" },
];
const BOARD_POOL = ["Grupo Alquimia Alimentos", "Hoteles Bahía Azul", "Clínica Dentalia Norte"];
const TEAMX_POOL = ["Autopartes Rivera", "Farmacias del Valle", "Constructora Roble"];

const CHAT = [
  "¿Tienes el último corte de datos?",
  "Revisa mi borrador cuando puedas.",
  "¿Qué benchmark usamos aquí?",
  "Te mandé el tablero actualizado.",
  "¿Validamos este supuesto?",
];

const meetingSeatIds = spots.filter((s) => s.room === "junta" && s.kind === "seat").map((s) => s.id);
const waitSpotIds = spots.filter((s) => s.kind === "wait").map((s) => s.id);
const loungeSpots = spots.filter((s) => s.kind === "lounge");

export class DayScript {
  private readonly sim: Simulation;
  private readonly by = new Map<string, Person>();
  private readonly waitTaken = new Set<string>();
  private decisionId = 0;
  private stopped = false;
  private visitors = new Set<string>();

  constructor(sim: Simulation) {
    this.sim = sim;
    for (const person of sim.people) this.by.set(person.id, person);

    // Cada agente sale por una de las tres bandas del motor.
    roster.forEach((agent, i) => {
      this.sim.workOf(this.agent(agent.key)).lane = i % 3;
    });
  }

  private agent(key: string): Person {
    const person = this.by.get(key);
    if (!person) throw new Error(`Agente desconocido: ${key}`);
    return person;
  }

  private get human(): Person {
    return this.agent("socio");
  }

  stop() {
    this.stopped = true;
  }

  // --- primitivas del guion ------------------------------------------------

  private say(person: Person, text: string, duration = 4.4) {
    person.bubble = { text, until: this.sim.time + duration };
  }

  private async line(person: Person, text: string, duration = 4.4) {
    this.say(person, text, duration);
    this.sim.log(person, text);
    await this.sim.sleep(duration);
  }

  private setState(person: Person, state: PersonState, task?: string) {
    person.state = state;
    if (task !== undefined) person.task = task;
    this.sim.notify();
  }

  private startTask(person: Person, text: string, state: PersonState = "working") {
    const work = this.sim.workOf(person);
    for (const item of work.queue) {
      if (item.status === "en curso") {
        item.status = "hecho";
        work.done += 1;
      }
    }
    work.queue.push({ text, status: "en curso" });
    if (work.queue.length > 7) work.queue.splice(0, work.queue.length - 7);
    this.setState(person, state, text);
  }

  /** Reserva agentes para un hilo del guion, esperando a que se desocupen. */
  private async claim(list: Person[], token: symbol) {
    for (const person of list) {
      const work = this.sim.workOf(person);
      while ((work.busy && work.busy !== token) || work.inAmbient) {
        if (this.stopped) return;
        await this.sim.sleep(0.2);
      }
      work.busy = token;
    }
  }

  private release(list: Person[]) {
    for (const person of list) {
      const work = this.sim.workOf(person);
      work.busy = null;
      work.nextAmbient = this.sim.time + rand(5, 12);
    }
  }

  private async meeting(list: Person[], title: string, token: symbol, body: () => Promise<void>) {
    await this.claim(list, token);
    if (this.stopped) return;

    this.sim.meetingTitle = title;
    this.sim.notify();
    for (const person of list) this.startTask(person, title, "meeting");

    const n = list.length;
    await Promise.all(
      list.map((person, i) => {
        const seat = meetingSeatIds[Math.round((i * 12) / n) % meetingSeatIds.length];
        return seat ? walkToSpot(person, seat) : Promise.resolve();
      }),
    );

    this.sim.log(null, "Inicia en sala de juntas: " + title, "meet");
    this.focus("junta");

    await body();

    this.sim.meetingTitle = "";
    this.sim.notify();
    this.focus("general");

    await Promise.all(
      list.map((person) => {
        this.setState(person, "working", "Aterrizando acuerdos: " + title);
        return walkHome(person);
      }),
    );
    this.release(list);
  }

  private focus(room: string) {
    this.sim.focusRequest = room;
    this.sim.notify();
  }

  /** El gate humano: el agente camina a tu oficina y espera en ámbar. */
  private askHuman(person: Person, request: DecisionRequest): Promise<"approve" | "changes"> {
    return new Promise((resolve) => {
      void (async () => {
        const spotId = waitSpotIds.find((id) => !this.waitTaken.has(id)) ?? waitSpotIds[0];
        if (!spotId) return;
        this.waitTaken.add(spotId);

        this.setState(person, "collab", "Llevando una decisión a Agustín");
        await walkToSpot(person, spotId);

        this.setState(person, "awaiting", request.title);
        this.sim.workOf(person).queue.push({ text: request.title, status: "espera" });
        this.say(person, request.ask, 5);
        this.sim.log(person, "espera tu decisión: " + request.title, "wait");

        const decision = {
          ...request,
          id: ++this.decisionId,
          agentId: person.id,
          agentName: person.label,
          at: this.sim.time,
          resolve: (outcome: "approve" | "changes") => {
            const index = this.sim.inbox.indexOf(decision);
            if (index < 0) return;
            this.sim.inbox.splice(index, 1);
            this.waitTaken.delete(spotId);
            this.sim.humanMinutes += 45;

            for (const item of this.sim.workOf(person).queue) {
              if (item.status === "espera") item.status = "hecho";
            }

            this.say(
              this.human,
              outcome === "approve" ? "Aprobado. Adelante." : "Ajusten el alcance, por favor.",
              3.6,
            );
            this.sim.log(
              this.human,
              (outcome === "approve" ? "aprobó: " : "pidió ajustes: ") + request.title,
              "human",
            );
            this.setState(
              person,
              "working",
              outcome === "approve" ? "Ejecutando lo aprobado" : "Incorporando ajustes de Agustín",
            );
            resolve(outcome);
          },
        };

        this.sim.inbox.push(decision);
        this.sim.notify();
        if (!this.sim.meetingTitle) {
          this.focus("socio");
          this.sim.focusUntil = this.sim.time + 7;
        }
      })();
    });
  }

  private spawnVisitor(name: string, company: string): Person {
    const visitor = personAtSpot(
      `visitor-${++this.decisionId}-${Date.now()}`,
      "visitor",
      name,
      {
        wear: "#7f8b8e",
        accent: "#3e4a4e",
        pants: "#3a4448",
        hair: pick(["#2b1d16", "#8d8d8d", "#3a2a20"]),
        skin: pick(["#e0b48f", "#c68e63", "#d9a57c"]),
      },
      "lobby.client",
      "idle",
      company,
    );
    visitor.x = 500;
    visitor.y = 712;
    visitor.room = "lobby";
    visitor.seat = null;
    this.sim.people.push(visitor);
    this.by.set(visitor.id, visitor);
    this.visitors.add(visitor.id);
    this.sim.notify();
    return visitor;
  }

  private removePerson(person: Person) {
    const index = this.sim.people.indexOf(person);
    if (index >= 0) this.sim.people.splice(index, 1);
    this.by.delete(person.id);
    this.visitors.delete(person.id);
    this.sim.notify();
  }

  // --- hilos del dia -------------------------------------------------------

  private async leadThread(client: Client) {
    const token = Symbol("lead");
    const visitor = this.spawnVisitor(client.contact ?? "Visita", client.name);
    this.sim.setClient(client, "Llegó por SCANx en línea", 8);
    this.sim.log(null, `Nuevo lead: ${client.name} completó el diagnóstico SCANx`, "sys");

    await walkToPoint(visitor, "lobby", 410, 634);

    const paula = this.agent("paula");
    await this.claim([paula], token);
    this.startTask(paula, "Recibiendo a " + client.name, "collab");
    await walkToPoint(paula, "lobby", 456, 650, [410, 634]);
    await this.line(paula, "Bienvenidos. Ya tenemos su diagnóstico.");
    await this.line(visitor, "Queremos crecer, pero algo nos frena.");
    await this.line(paula, "Hoy mismo tendrán una propuesta concreta.");
    this.startTask(paula, "Registrando lead en CRM");
    void walkHome(paula).then(() => this.release([paula]));

    const nora = this.agent("nora");
    const lucia = this.agent("lucia");
    const diego = this.agent("diego");
    await this.claim([diego, lucia, nora], token);
    this.sim.setClient(client, "Procesando diagnóstico", 22);

    await Promise.all([
      (async () => {
        this.startTask(nora, "Procesando 142 respuestas SCANx · 6 áreas");
        this.sim.burst(nora, 14);
        await this.sim.sleep(13);
        await this.line(nora, "Contradicción: ventas dice 30 días de cobro, finanzas dice 74.");
      })(),
      (async () => {
        this.startTask(lucia, "Normalizando EBITDA 2021–2025");
        this.sim.burst(lucia, 10);
        await this.sim.sleep(16);
        await this.line(lucia, "EBITDA ajustado 9.8% contra 14.1% de la industria.");
      })(),
      (async () => {
        this.startTask(diego, "Benchmark: 6 comparables del sector");
        this.sim.burst(diego, 8);
        await this.sim.sleep(11);
        await this.line(diego, "Los comparables cobran en 41 días promedio.");
        this.startTask(diego, "Integrando benchmark al expediente");
      })(),
    ]);

    this.release([diego]);
    this.sim.setClient(client, "Diagnóstico listo", 35);

    const sofia = this.agent("sofia");
    const ricardo = this.agent("ricardo");
    const mateo = this.agent("mateo");
    const valeria = this.agent("valeria");

    await this.claim([sofia], token);
    await this.line(sofia, `Kickoff de ${client.name} en sala de juntas.`, 3.5);

    await this.meeting([sofia, ricardo, mateo, valeria, lucia, nora], `Kickoff · ${client.name}`, token, async () => {
      await this.line(sofia, "Objetivo: propuesta aprobada hoy.");
      await this.line(nora, "Índice de confiabilidad 71%. Ventas y finanzas no coinciden.");
      await this.line(lucia, "El dinero está atorado en cobranza: 74 días.");
      await this.line(ricardo, "Ahí está el problema real. No es ventas, es flujo.");
      await this.line(mateo, "Framework fase 2: cobranza como proceso habilitador.");
      await this.line(valeria, "Armo el plan de 14 semanas con 3 frentes.");
      await this.line(ricardo, "Precio sugerido: 186 mil. Lo llevo con Agustín.");
    });

    this.sim.setClient(client, "Diseñando plan de trabajo", 55);

    await this.claim([valeria, diego], token);
    this.startTask(valeria, "Plan de trabajo 14 semanas · 3 frentes");
    this.startTask(diego, "Minuta del kickoff");
    this.sim.burst(valeria, 10);
    await this.sim.sleep(6);

    this.startTask(diego, "Consultando a Valeria", "collab");
    const valeriaHome = spotById.get(valeria.home);
    if (valeriaHome) {
      await walkToPoint(diego, "bull", valeriaHome.at[0] + 34, valeriaHome.at[1] + 2, valeriaHome.at);
    }
    await this.line(diego, "¿Incluyo el tablero TEAMx en la semana 3?");
    await this.line(valeria, "Mejor en la 4, después del mapa de procesos.");
    await walkHome(diego);
    this.startTask(diego, "Anexos de la propuesta");
    this.sim.burst(diego, 5);
    await this.sim.sleep(7);
    await this.line(valeria, "Plan listo. Ricardo, es tuyo.");
    this.release([valeria, diego]);

    this.sim.setClient(client, "Propuesta en tu revisión", 75);
    await this.claim([ricardo], token);
    this.startTask(ricardo, "Propuesta final · " + client.name);
    this.sim.burst(ricardo, 6);
    await this.sim.sleep(4);

    const outcome = await this.askHuman(ricardo, {
      title: "Aprobar propuesta · " + client.name,
      amount: "$186,000 MXN · 14 semanas",
      ask: "Agustín, necesito tu visto bueno.",
      bullets: [
        "Problema raíz: flujo atorado en cobranza (74 días contra 41 del sector).",
        "Framework fase 2 con cobranza como proceso habilitador.",
        "Incluye TEAMx para 2 líderes comerciales desde la semana 4.",
      ],
    });

    if (outcome === "changes") {
      await this.line(ricardo, "Entendido. Ajustamos alcance.", 3);
      await walkHome(ricardo);
      await this.claim([valeria], token);
      this.startTask(valeria, "Ajustando alcance a 12 semanas");
      this.sim.burst(valeria, 8);
      this.sim.setClient(client, "Ajustando alcance", 68);
      await this.sim.sleep(10);
      await this.line(valeria, "Listo: 12 semanas, mismo impacto.");
      this.release([valeria]);
      this.sim.setClient(client, "Propuesta en tu revisión", 80);
      // El prototipo pide la segunda aprobacion y sigue igual en ambos casos:
      // el resultado no se vuelve a leer.
      await this.askHuman(ricardo, {
        title: "Propuesta ajustada · " + client.name,
        amount: "$164,000 MXN · 12 semanas",
        ask: "Ya con tus ajustes. ¿La enviamos?",
        bullets: [
          "Alcance ajustado a 12 semanas, como pediste.",
          "Se mantiene el frente de cobranza y el tablero TEAMx.",
          "Arranque sugerido: lunes próximo.",
        ],
      });
    }

    await this.line(ricardo, "Aprobada. Paula, envíala hoy.", 3.5);
    void walkHome(ricardo).then(() => {
      this.startTask(ricardo, pick(roster.find((a) => a.key === "ricardo")!.routine));
      this.release([ricardo]);
    });

    await this.claim([paula], token);
    this.startTask(paula, "Enviando propuesta a " + client.name, "collab");
    this.sim.burst(paula, 4);
    await walkToPoint(paula, "lobby", 456, 650, [410, 634]);
    await this.line(paula, "Propuesta enviada. Arrancamos el lunes.");
    await this.line(visitor, "Excelente. Nos vemos el lunes.");
    this.sim.setClient(client, "Propuesta enviada", 100);
    void walkHome(paula).then(() => {
      this.startTask(paula, pick(roster.find((a) => a.key === "paula")!.routine));
      this.release([paula]);
    });

    await walkToPoint(visitor, "lobby", 500, 730);
    this.removePerson(visitor);
  }

  private async boardThread(client: Client) {
    const token = Symbol("board");
    const andres = this.agent("andres");
    const tomas = this.agent("tomas");
    const elena = this.agent("elena");

    await this.claim([andres, tomas], token);
    this.sim.setClient(client, "Preparando consejo técnico Q4", 30);
    this.startTask(andres, "Consolidando scorecard Q3 · 12 indicadores");
    this.sim.burst(andres, 8);
    this.startTask(tomas, "Conectando el CRM del cliente vía API");
    this.sim.burst(tomas, 10);
    await this.sim.sleep(10);

    this.startTask(tomas, "Llevando datos a Andrés", "collab");
    const andresHome = spotById.get(andres.home);
    if (andresHome) {
      await walkToPoint(tomas, "bull", andresHome.at[0] + 34, andresHome.at[1] + 2, andresHome.at);
    }
    await this.line(tomas, "Ventas ya entran en vivo al scorecard.");
    await this.line(andres, "Perfecto. Con eso cierro el Q3.");
    void walkHome(tomas).then(() => {
      this.startTask(tomas, pick(roster.find((a) => a.key === "tomas")!.routine));
      this.release([tomas]);
    });

    await this.sim.sleep(5);
    this.sim.setClient(client, "Scorecard listo", 55);

    await this.claim([elena], token);
    this.startTask(andres, "Revisión con Dirección", "collab");
    this.startTask(elena, "Revisión del consejo " + client.name, "collab");
    await walkToSpot(andres, "dir.visit-1");
    await this.line(andres, "KPI principal del Q3 cerró en 87%. Semáforo amarillo.");
    await this.line(elena, 'Propongo temática Q4: "Cobrar a tiempo".');
    await this.line(andres, "Preparo agenda con tiempos y convocatoria.");
    void walkHome(andres).then(() => this.startTask(andres, "Agenda del consejo " + client.name));

    this.sim.setClient(client, "Temática Q4 en tu revisión", 70);
    await this.askHuman(elena, {
      title: "Temática y KPI del Q4 · " + client.name,
      amount: "Consejo técnico en 8 días",
      ask: "Necesito validar la temática del trimestre.",
      bullets: [
        'Temática propuesta: "Cobrar a tiempo".',
        "KPI principal: días de cartera por debajo de 45.",
        "5 consejeros convocados · agenda de 2 h con tiempos.",
      ],
    });

    await this.line(elena, "Validado. Andrés, convoca.", 3);
    void walkHome(elena).then(() => {
      this.startTask(elena, pick(roster.find((a) => a.key === "elena")!.routine));
      this.release([elena]);
    });

    await this.sim.sleep(3);
    this.startTask(andres, "Convocatoria enviada a 5 consejeros");
    this.sim.burst(andres, 5);
    this.sim.log(andres, "envió la convocatoria del consejo de " + client.name, "done");
    this.sim.setClient(client, "Consejo convocado", 100);
    await this.sim.sleep(6);
    this.release([andres]);
  }

  private async teamxThread(client: Client) {
    const token = Symbol("teamx");
    const marco = this.agent("marco");
    const sofia = this.agent("sofia");

    await this.claim([marco], token);
    this.sim.setClient(client, "Evaluación semanal · semana 6", 25);
    this.startTask(marco, "Evaluando a 14 líderes · semana 6");
    this.sim.burst(marco, 12);
    await this.sim.sleep(14);
    await this.line(marco, "Dos líderes en rojo: eficiencia 78% y 81%.");
    this.sim.setClient(client, "2 líderes en rojo", 50);

    await this.claim([sofia], token);
    this.startTask(marco, "Coordinando seguimiento con Sofía", "collab");
    await walkToPoint(marco, "pm", 1030, 500, [1070, 486]);
    await this.line(marco, "El director comercial lleva 3 semanas en rojo.");
    await this.line(sofia, "Eso ya pide una sesión presencial con Agustín.");
    this.release([sofia]);
    this.sim.setClient(client, "Sesión 1:1 en tu revisión", 65);

    const outcome = await this.askHuman(marco, {
      title: "Sesión 1:1 presencial · " + client.name,
      amount: "45 min · jueves 10:00",
      ask: "Aquí hace falta tu presencia.",
      bullets: [
        "Director comercial: 3 semanas en rojo (eficiencia 78%).",
        "La IA preparó 3 preguntas poderosas y el radar comparado.",
        "Es parte del 20% humano: la conversación la llevas tú.",
      ],
    });

    await this.line(
      marco,
      outcome === "approve" ? "Agendado. Te dejo el brief listo." : "Busco otra fecha y te la propongo.",
      3.5,
    );
    await walkHome(marco);
    this.startTask(marco, "Brief de la sesión 1:1");
    this.sim.burst(marco, 5);
    this.sim.setClient(client, outcome === "approve" ? "Sesión agendada" : "Reagendando sesión", 100);
    await this.sim.sleep(6);
    this.release([marco]);
  }

  /** Vida propia entre hilos del guion: rutina, café o consultar a alguien. */
  private async ambient(person: Person) {
    const work = this.sim.workOf(person);
    work.inAmbient = true;
    const definition = roster.find((a) => a.key === person.id);
    const r = Math.random();

    if (r < 0.62) {
      if (definition) this.startTask(person, pick(definition.routine));
      await this.sim.sleep(rand(10, 18));
    } else if (r < 0.8) {
      this.setState(person, "idle", "Pausa de café");
      const spot = pick(loungeSpots);
      await walkToPoint(
        person,
        "lounge",
        spot.at[0] + rand(-8, 8),
        spot.at[1] + rand(-6, 6),
        [140, 605],
      );
      await this.sim.sleep(rand(5, 9));
      await walkHome(person);
      if (definition) this.startTask(person, pick(definition.routine));
    } else {
      const others = this.sim.people.filter(
        (p) => p.kind === "agent" && p !== person && p.seat === p.home && !p.moving,
      );
      const other = others.length ? pick(others) : null;
      if (other) {
        this.setState(person, "collab", "Consultando a " + other.label);
        const home = spotById.get(other.home);
        if (home) {
          await walkToPoint(person, home.room, home.at[0] + 34, home.at[1] + 2, home.at);
        }
        this.say(person, pick(CHAT), 3.6);
        await this.sim.sleep(4);
        await walkHome(person);
        if (definition) this.startTask(person, pick(definition.routine));
      }
    }

    work.inAmbient = false;
    work.nextAmbient = this.sim.time + rand(6, 14);
  }

  /** Se llama cada cuadro: dispara la vida ambiental de quien esté libre. */
  tickAmbient() {
    for (const person of this.sim.people) {
      if (person.kind !== "agent") continue;
      const work = this.sim.workOf(person);
      if (work.busy || work.inAmbient || person.moving) continue;
      if (this.sim.time < work.nextAmbient) continue;
      void this.ambient(person);
    }
  }

  private newDay() {
    this.sim.day += 1;
    this.sim.dayStart = this.sim.time;
    this.sim.automatedTasks = 0;
    this.sim.automatedMinutes = 0;
    this.sim.humanMinutes = 0;
    for (const [, work] of this.sim.work) {
      work.done = 0;
      work.automated = 0;
    }

    const i = this.sim.day - 1;
    const lead = LEAD_POOL[i % LEAD_POOL.length] as { name: string; contact: string };
    this.sim.clients = [
      { name: lead.name, contact: lead.contact, service: "SCANx → Propuesta", stage: "Por llegar", progress: 0 },
      { name: BOARD_POOL[i % BOARD_POOL.length] as string, service: "BOARDx", stage: "Consejo Q4", progress: 10 },
      { name: TEAMX_POOL[i % TEAMX_POOL.length] as string, service: "TEAMx", stage: "Semana 6", progress: 10 },
      { name: "Distribuidora Palma", service: "Consultoría fase 3", stage: "Implementación", progress: 62 },
    ];
    this.sim.log(null, `${this.sim.dayName()}: la oficina abre`, "sys");
  }

  /** Bucle infinito de jornadas. */
  async run() {
    while (!this.stopped) {
      this.newDay();
      const [lead, board, teamx] = this.sim.clients;
      if (!lead || !board || !teamx) return;

      await this.sim.sleep(5);
      const elena = this.agent("elena");
      await this.line(elena, "Standup en sala de juntas.", 3);

      const everyone = this.sim.people.filter((p) => p.kind === "agent");
      await this.meeting(everyone, "Standup diario", Symbol("standup"), async () => {
        await this.line(elena, `Buenos días. Prioridad de hoy: ${lead.name}.`);
        await this.line(
          this.agent("sofia"),
          "3 clientes activos y un lead nuevo. Habrá 3 decisiones para Agustín.",
        );
        await this.line(this.agent("marco"), `TEAMx ${teamx.name}: semana 6, dos líderes en rojo.`);
        await this.line(this.agent("andres"), `Consejo técnico de ${board.name} en 8 días.`);
        await this.line(elena, "Perfecto. A trabajar.", 3);
      });

      await Promise.all([
        this.leadThread(lead),
        this.sim.sleep(16).then(() => this.boardThread(board)),
        this.sim.sleep(34).then(() => this.teamxThread(teamx)),
      ]);

      while (this.sim.clockMinutes() < 17 * 60 + 10 && !this.stopped) await this.sim.sleep(1);

      await this.claim([elena], Symbol("close"));
      await this.line(elena, "Cierre del día: resumen ejecutivo enviado a Agustín.", 5);
      this.release([elena]);
      await this.sim.sleep(8);
    }
  }
}
