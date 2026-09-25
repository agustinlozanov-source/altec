import type { AgentState, OfficeEvent } from "./contract";

/**
 * Estado derivado (docs/ALTEC-VO.md §3).
 *
 * La oficina reconstruye todo aplicando eventos en orden. Este reductor es
 * puro y no sabe nada de React ni de three.js: la misma funcion sirve para la
 * vista 3D, la 2D y para auditar la bitacora.
 */

export type AgentRuntime = {
  agentId: string;
  state: AgentState;
  task?: string;
  room?: string;
  spot?: string;
  lookAt?: string;
  /** Globo de dialogo activo; caduca solo con `sayUntil`. */
  say?: string;
  sayUntil?: number;
  tasksDone: number;
};

export type Decision = {
  decisionId: string;
  agentId?: string;
  title: string;
  amount?: string;
  bullets: string[];
  ask: string;
  at: string;
  resolved?: { outcome: "approve" | "changes"; note?: string; by: string; at: string };
};

export type Meeting = {
  meetingId: string;
  title: string;
  participants: string[];
  startedAt: string;
  endedAt?: string;
};

export type ClientRuntime = {
  clientId: string;
  name: string;
  contact?: string;
  stage?: string;
  progress: number;
  present: boolean;
};

export type FeedEntry = {
  id: string;
  at: string;
  kind: OfficeEvent["type"];
  agentId?: string;
  text: string;
};

export type Automation = {
  tasks: number;
  minutesSaved: number;
  byLane: Record<"data" | "analysis" | "documents", number>;
};

export type OfficeState = {
  agents: Record<string, AgentRuntime>;
  decisions: Decision[];
  meetings: Meeting[];
  clients: Record<string, ClientRuntime>;
  feed: FeedEntry[];
  automation: Automation;
};

export const emptyOfficeState: OfficeState = {
  agents: {},
  decisions: [],
  meetings: [],
  clients: {},
  feed: [],
  automation: { tasks: 0, minutesSaved: 0, byLane: { data: 0, analysis: 0, documents: 0 } },
};

const FEED_LIMIT = 120;

function agentOf(state: OfficeState, agentId: string): AgentRuntime {
  return state.agents[agentId] ?? { agentId, state: "idle", tasksDone: 0 };
}

function pushFeed(state: OfficeState, entry: FeedEntry): FeedEntry[] {
  return [entry, ...state.feed].slice(0, FEED_LIMIT);
}

/** Aplica un evento y devuelve un estado nuevo. Nunca muta el anterior. */
export function applyEvent(state: OfficeState, event: OfficeEvent): OfficeState {
  const feed = (text: string): FeedEntry => ({
    id: event.id,
    at: event.at,
    kind: event.type,
    ...(event.agentId ? { agentId: event.agentId } : {}),
    text,
  });

  switch (event.type) {
    case "agent.state": {
      if (!event.agentId) return state;
      const agent = agentOf(state, event.agentId);
      return {
        ...state,
        agents: {
          ...state.agents,
          [event.agentId]: {
            ...agent,
            state: event.state,
            ...(event.task ? { task: event.task } : {}),
          },
        },
      };
    }

    case "agent.move": {
      if (!event.agentId) return state;
      const agent = agentOf(state, event.agentId);
      return {
        ...state,
        agents: {
          ...state.agents,
          [event.agentId]: {
            ...agent,
            room: event.room,
            ...(event.spot ? { spot: event.spot } : { spot: undefined }),
            ...(event.lookAt ? { lookAt: event.lookAt } : { lookAt: undefined }),
          },
        },
      };
    }

    case "agent.say": {
      if (!event.agentId) return state;
      const agent = agentOf(state, event.agentId);
      const ttl = (event.ttlSec ?? 4) * 1000;
      return {
        ...state,
        agents: {
          ...state.agents,
          [event.agentId]: {
            ...agent,
            say: event.text,
            sayUntil: Date.parse(event.at) + ttl,
          },
        },
      };
    }

    case "task.started": {
      if (!event.agentId) return state;
      const agent = agentOf(state, event.agentId);
      return {
        ...state,
        agents: { ...state.agents, [event.agentId]: { ...agent, task: event.title } },
        feed: pushFeed(state, feed(event.title)),
      };
    }

    case "task.completed": {
      if (!event.agentId) return state;
      const agent = agentOf(state, event.agentId);
      return {
        ...state,
        agents: {
          ...state.agents,
          [event.agentId]: { ...agent, tasksDone: agent.tasksDone + 1 },
        },
        feed: pushFeed(state, feed("Tarea completada")),
      };
    }

    case "meeting.started":
      return {
        ...state,
        meetings: [
          ...state.meetings,
          {
            meetingId: event.meetingId,
            title: event.title,
            participants: event.participants,
            startedAt: event.at,
          },
        ],
        feed: pushFeed(state, feed(`Inicia ${event.title}`)),
      };

    case "meeting.ended":
      return {
        ...state,
        meetings: state.meetings.map((m) =>
          m.meetingId === event.meetingId ? { ...m, endedAt: event.at } : m,
        ),
        feed: pushFeed(state, feed("Termina la junta")),
      };

    case "decision.requested":
      return {
        ...state,
        decisions: [
          {
            decisionId: event.decisionId,
            ...(event.agentId ? { agentId: event.agentId } : {}),
            title: event.title,
            ...(event.amount ? { amount: event.amount } : {}),
            bullets: event.bullets,
            ask: event.ask,
            at: event.at,
          },
          ...state.decisions,
        ],
        feed: pushFeed(state, feed(`Espera tu decisión: ${event.title}`)),
      };

    case "decision.resolved":
      return {
        ...state,
        decisions: state.decisions.map((d) =>
          d.decisionId === event.decisionId
            ? {
                ...d,
                resolved: {
                  outcome: event.outcome,
                  ...(event.note ? { note: event.note } : {}),
                  by: event.by,
                  at: event.at,
                },
              }
            : d,
        ),
        feed: pushFeed(
          state,
          feed(event.outcome === "approve" ? "Aprobado" : "Pediste ajustes"),
        ),
      };

    case "automation.done":
      return {
        ...state,
        automation: {
          tasks: state.automation.tasks + 1,
          minutesSaved: state.automation.minutesSaved + event.minutesSaved,
          byLane: {
            ...state.automation.byLane,
            [event.lane]: state.automation.byLane[event.lane] + 1,
          },
        },
      };

    case "client.arrived": {
      const clientId = event.clientId ?? event.name;
      return {
        ...state,
        clients: {
          ...state.clients,
          [clientId]: {
            clientId,
            name: event.name,
            ...(event.contact ? { contact: event.contact } : {}),
            progress: 0,
            present: true,
          },
        },
        feed: pushFeed(state, feed(`Llega ${event.name}`)),
      };
    }

    case "client.stage": {
      const clientId = event.clientId;
      if (!clientId) return state;
      const client = state.clients[clientId];
      if (!client) return state;
      return {
        ...state,
        clients: {
          ...state.clients,
          [clientId]: { ...client, stage: event.stage, progress: event.progress },
        },
      };
    }

    case "client.left": {
      const clientId = event.clientId;
      if (!clientId) return state;
      const client = state.clients[clientId];
      if (!client) return state;
      return {
        ...state,
        clients: { ...state.clients, [clientId]: { ...client, present: false } },
        feed: pushFeed(state, feed(`${client.name} se retira`)),
      };
    }

    default:
      return state;
  }
}

/** Reconstruye el estado desde cero. Sirve para cargar la bitacora. */
export function replay(events: OfficeEvent[], from: OfficeState = emptyOfficeState): OfficeState {
  return events.reduce(applyEvent, from);
}

/** Decisiones que siguen esperando a una persona. */
export function pendingDecisions(state: OfficeState): Decision[] {
  return state.decisions.filter((d) => !d.resolved);
}

/**
 * Medidor 80/20 (docs/ALTEC-VO.md §8.5): que parte del esfuerzo llevan los
 * agentes frente a lo que ha pasado por una persona.
 */
export function ratio8020(state: OfficeState): { agents: number; human: number } {
  const automated = state.automation.tasks;
  const human = state.decisions.filter((d) => d.resolved).length;
  const total = automated + human;
  if (total === 0) return { agents: 0, human: 0 };
  return {
    agents: Math.round((automated / total) * 100),
    human: Math.round((human / total) * 100),
  };
}
