import { human, roster } from "@altec/agents";
import { spots } from "../layouts/default";
import { personAtSpot, walkHome, walkToSpot, type Person } from "./people";

/** Arma la plantilla de la oficina a partir del roster. */
export function createOfficePeople(): Person[] {
  const agents = roster.map((agent) =>
    personAtSpot(
      agent.key,
      "agent",
      agent.shortName,
      { ...agent.look, pants: "#27343a" },
      agent.home,
      "working",
      agent.routine[0] ?? "",
    ),
  );

  const socio = personAtSpot(
    human.key,
    "human",
    human.shortName,
    { ...human.look, pants: "#2b3a3f" },
    human.home,
    "idle",
    "Disponible",
  );

  return [...agents, socio];
}

const randomBetween = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(list: readonly T[]): T | undefined =>
  list[Math.floor(Math.random() * list.length)];

/** Lugares a los que un agente puede ir a dar una vuelta. */
const wanderSpots = spots
  .filter((s) => s.kind === "lounge" || s.kind === "seat" || s.kind === "wait")
  .map((s) => s.id);

/**
 * Movimiento ambiental: de cuando en cuando un agente se levanta, va a otro
 * lado y regresa a su escritorio. Es lo que hace que la oficina no se vea
 * congelada mientras no corre el guion del dia.
 */
export function createAmbientLoop(people: Person[]) {
  const agents = people.filter((p) => p.kind === "agent");
  const next = new Map<string, number>();
  for (const agent of agents) next.set(agent.id, randomBetween(3, 18));

  let elapsed = 0;

  return function tick(dt: number) {
    elapsed += dt;

    for (const agent of agents) {
      if (agent.moving || agent.state === "awaiting") continue;
      const due = next.get(agent.id) ?? Infinity;
      if (elapsed < due) continue;

      next.set(agent.id, elapsed + randomBetween(14, 34));

      // La mitad de las veces vuelve a su lugar; la otra da una vuelta.
      if (agent.seat !== agent.home) {
        agent.state = "working";
        void walkHome(agent);
        continue;
      }

      const destination = pick(wanderSpots);
      if (!destination) continue;
      agent.state = "collab";
      void walkToSpot(agent, destination).then(() => {
        agent.state = "idle";
        next.set(agent.id, elapsed + randomBetween(4, 10));
      });
    }
  };
}
