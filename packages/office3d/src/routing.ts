import {
  corridorEdges,
  corridorNodes,
  roomById,
  spotById,
  type Point,
} from "./layouts/default";

/**
 * Rutas por pasillos (docs/ALTEC-VO.md §4 y §8.3).
 *
 * El evento `agent.move` dice A DONDE va el agente, nunca COMO llega. El
 * camino lo calcula la oficina: nadie atraviesa paredes.
 */

const distance = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);

const adjacency = new Map<string, [string, number][]>();
for (const key of Object.keys(corridorNodes)) adjacency.set(key, []);
for (const [a, b] of corridorEdges) {
  const pa = corridorNodes[a];
  const pb = corridorNodes[b];
  if (!pa || !pb) continue;
  const d = distance(pa, pb);
  adjacency.get(a)?.push([b, d]);
  adjacency.get(b)?.push([a, d]);
}

type ShortestPath = { cost: number; nodes: string[] };

/** Dijkstra sobre la red de pasillos. El grafo es pequeno; basta con esto. */
function shortestPath(from: string, to: string): ShortestPath {
  const dist = new Map<string, number>();
  const prev = new Map<string, string>();
  const queue = new Set(Object.keys(corridorNodes));

  for (const key of queue) dist.set(key, Infinity);
  dist.set(from, 0);

  while (queue.size) {
    let current: string | null = null;
    for (const key of queue) {
      if (current === null || (dist.get(key) ?? Infinity) < (dist.get(current) ?? Infinity)) {
        current = key;
      }
    }
    if (current === null) break;
    queue.delete(current);
    if (current === to) break;

    for (const [next, weight] of adjacency.get(current) ?? []) {
      const candidate = (dist.get(current) ?? Infinity) + weight;
      if (candidate < (dist.get(next) ?? Infinity)) {
        dist.set(next, candidate);
        prev.set(next, current);
      }
    }
  }

  const nodes: string[] = [];
  let cursor: string | undefined = to;
  while (cursor) {
    nodes.unshift(cursor);
    cursor = prev.get(cursor);
  }

  return { cost: dist.get(to) ?? Infinity, nodes };
}

/**
 * Camino desde una posicion concreta hasta un destino.
 * Devuelve puntos del plano; el ultimo es el destino.
 */
export function route(
  from: { room: string; at: Point },
  toRoom: string,
  toPoint: Point,
): Point[] {
  if (from.room === toRoom) return [toPoint];

  const origin = roomById.get(from.room);
  const target = roomById.get(toRoom);
  if (!origin || !target) return [toPoint];

  const originDoors = origin.doors.filter((d) => d.node);
  const targetDoors = target.doors.filter((d) => d.node);
  if (!originDoors.length || !targetDoors.length) return [toPoint];

  let best: { total: number; path: Point[] } | null = null;

  for (const a of originDoors) {
    for (const b of targetDoors) {
      const leg = shortestPath(a.node as string, b.node as string);
      if (!Number.isFinite(leg.cost)) continue;

      const total = distance(from.at, a.inside) + leg.cost + distance(b.inside, toPoint);
      if (best && total >= best.total) continue;

      best = {
        total,
        path: [
          a.inside,
          ...leg.nodes.map((n) => corridorNodes[n]).filter((p): p is Point => Boolean(p)),
          b.inside,
          toPoint,
        ],
      };
    }
  }

  return best ? best.path : [toPoint];
}

/** Camino hacia un lugar con nombre. Es lo que consume `agent.move`. */
export function routeToSpot(from: { room: string; at: Point }, spotId: string): Point[] {
  const spot = spotById.get(spotId);
  if (!spot) return [];
  return route(from, spot.room, spot.at);
}

/** Largo total del camino, para estimar cuanto tarda el agente en llegar. */
export function pathLength(path: Point[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i += 1) {
    const a = path[i - 1];
    const b = path[i];
    if (a && b) total += distance(a, b);
  }
  return total;
}
