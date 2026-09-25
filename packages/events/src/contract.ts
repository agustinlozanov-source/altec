import { z } from "zod";

/**
 * Contrato de eventos de la oficina (docs/ALTEC-VO.md §4).
 *
 * Es la frontera entre el motor y la interfaz. La simulacion y la operacion
 * real emiten exactamente estos eventos, por eso cambiar de una a otra no
 * toca la interfaz (principio 3).
 *
 * Se valida con zod en el emisor y en el receptor.
 */

export const agentStates = ["working", "meeting", "collab", "awaiting", "idle"] as const;
export const agentStateSchema = z.enum(agentStates);
export type AgentState = (typeof agentStates)[number];

/** Las salas viven en el layout (packages/office3d). Aqui solo viaja el id. */
export const roomIdSchema = z.string().min(1);
export const spotIdSchema = z.string().min(1);
export type RoomId = string;
export type SpotId = string;

const eventBaseSchema = z.object({
  id: z.uuid(),
  at: z.iso.datetime(),
  officeId: z.string().min(1),
  agentId: z.string().min(1).optional(),
  clientId: z.string().min(1).optional(),
  projectId: z.string().min(1).optional(),
});

export type EventBase = z.infer<typeof eventBaseSchema>;

const payloadSchemas = [
  z.object({ type: z.literal("agent.state"), state: agentStateSchema, task: z.string().optional() }),
  z.object({
    type: z.literal("agent.move"),
    room: roomIdSchema,
    spot: spotIdSchema.optional(),
    lookAt: spotIdSchema.optional(),
  }),
  z.object({ type: z.literal("agent.say"), text: z.string(), ttlSec: z.number().positive().optional() }),
  z.object({ type: z.literal("task.started"), taskId: z.string(), title: z.string() }),
  z.object({ type: z.literal("task.completed"), taskId: z.string(), outputRef: z.string().optional() }),
  z.object({
    type: z.literal("meeting.started"),
    meetingId: z.string(),
    title: z.string(),
    participants: z.array(z.string()),
  }),
  z.object({
    type: z.literal("meeting.ended"),
    meetingId: z.string(),
    summaryRef: z.string().optional(),
  }),
  z.object({
    type: z.literal("decision.requested"),
    decisionId: z.string(),
    title: z.string(),
    amount: z.string().optional(),
    bullets: z.array(z.string()),
    ask: z.string(),
  }),
  z.object({
    type: z.literal("decision.resolved"),
    decisionId: z.string(),
    outcome: z.enum(["approve", "changes"]),
    note: z.string().optional(),
    by: z.string(),
  }),
  z.object({
    type: z.literal("automation.done"),
    lane: z.enum(["data", "analysis", "documents"]),
    minutesSaved: z.number().nonnegative(),
  }),
  z.object({ type: z.literal("client.arrived"), name: z.string(), contact: z.string().optional() }),
  z.object({ type: z.literal("client.stage"), stage: z.string(), progress: z.number().min(0).max(100) }),
  z.object({ type: z.literal("client.left") }),
] as const;

export const officeEventSchema = z.discriminatedUnion(
  "type",
  payloadSchemas.map((schema) => eventBaseSchema.extend(schema.shape)) as unknown as [
    z.ZodObject<z.ZodRawShape>,
    ...z.ZodObject<z.ZodRawShape>[],
  ],
);

export type OfficeEvent = EventBase &
  (
    | { type: "agent.state"; state: AgentState; task?: string }
    | { type: "agent.move"; room: RoomId; spot?: SpotId; lookAt?: SpotId }
    | { type: "agent.say"; text: string; ttlSec?: number }
    | { type: "task.started"; taskId: string; title: string }
    | { type: "task.completed"; taskId: string; outputRef?: string }
    | { type: "meeting.started"; meetingId: string; title: string; participants: string[] }
    | { type: "meeting.ended"; meetingId: string; summaryRef?: string }
    | {
        type: "decision.requested";
        decisionId: string;
        title: string;
        amount?: string;
        bullets: string[];
        ask: string;
      }
    | {
        type: "decision.resolved";
        decisionId: string;
        outcome: "approve" | "changes";
        note?: string;
        by: string;
      }
    | { type: "automation.done"; lane: "data" | "analysis" | "documents"; minutesSaved: number }
    | { type: "client.arrived"; name: string; contact?: string }
    | { type: "client.stage"; stage: string; progress: number }
    | { type: "client.left" }
  );

export type OfficeEventType = OfficeEvent["type"];

/** Valida y estrecha el tipo. Lanza si el evento no cumple el contrato. */
export function parseOfficeEvent(input: unknown): OfficeEvent {
  return officeEventSchema.parse(input) as OfficeEvent;
}

/** Valida sin lanzar. Util en el receptor, para descartar y seguir. */
export function safeParseOfficeEvent(input: unknown) {
  const result = officeEventSchema.safeParse(input);
  return result.success
    ? { ok: true as const, event: result.data as OfficeEvent }
    : { ok: false as const, error: result.error };
}
