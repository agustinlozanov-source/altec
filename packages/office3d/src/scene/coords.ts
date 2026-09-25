import { PLAN_HEIGHT, PLAN_WIDTH, type Point } from "../layouts/default";

/**
 * El layout vive en coordenadas de plano (1200 x 720, origen arriba izquierda).
 * La escena trabaja en coordenadas de mundo con Y hacia arriba, centradas en
 * el origen. Esta es la unica frontera entre los dos sistemas.
 */

export const CENTER_X = PLAN_WIDTH / 2;
export const CENTER_Z = PLAN_HEIGHT / 2;

export const wx = (x: number) => x - CENTER_X;
export const wz = (y: number) => y - CENTER_Z;

/** Punto del plano a posicion de mundo, con altura opcional. */
export function toWorld(point: Point, y = 0): [number, number, number] {
  return [wx(point[0]), y, wz(point[1])];
}

export const WALL_HEIGHT = 46;
export const WALL_THICKNESS = 4;
