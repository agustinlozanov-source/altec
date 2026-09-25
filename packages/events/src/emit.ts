import type { AgentState, EventBase, OfficeEvent } from "./contract";

/**
 * Constructores de eventos. Rellenan `id` y `at` para que ningun emisor
 * tenga que acordarse, y mantienen el tipo estrecho.
 */

type Meta = Omit<EventBase, "id" | "at"> & { at?: string };

function envelope(meta: Meta): EventBase {
  return {
    id: crypto.randomUUID(),
    at: meta.at ?? new Date().toISOString(),
    officeId: meta.officeId,
    ...(meta.agentId ? { agentId: meta.agentId } : {}),
    ...(meta.clientId ? { clientId: meta.clientId } : {}),
    ...(meta.projectId ? { projectId: meta.projectId } : {}),
  };
}

type PayloadOf<T extends OfficeEvent["type"]> = Omit<Extract<OfficeEvent, { type: T }>, keyof EventBase>;

export function officeEvent<T extends OfficeEvent["type"]>(
  meta: Meta,
  payload: PayloadOf<T> & { type: T },
): OfficeEvent {
  return { ...envelope(meta), ...payload } as OfficeEvent;
}

export const agentState = (meta: Meta, state: AgentState, task?: string) =>
  officeEvent(meta, { type: "agent.state", state, ...(task ? { task } : {}) });

export const agentMove = (meta: Meta, room: string, spot?: string, lookAt?: string) =>
  officeEvent(meta, {
    type: "agent.move",
    room,
    ...(spot ? { spot } : {}),
    ...(lookAt ? { lookAt } : {}),
  });

export const agentSay = (meta: Meta, text: string, ttlSec?: number) =>
  officeEvent(meta, { type: "agent.say", text, ...(ttlSec ? { ttlSec } : {}) });
