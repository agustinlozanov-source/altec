"use client";

import { Html } from "@react-three/drei";
import { scene as sceneColors, furniture } from "../palette";
import type { Room as RoomData } from "../layouts/default";
import { WALL_HEIGHT, WALL_THICKNESS, wx, wz } from "./coords";

/**
 * Una sala: piso, muros con sus vanos y etiqueta.
 * Los muros se dibujan como cuatro tramos; cada puerta abre un hueco
 * partiendo el tramo en dos.
 */

type Side = "t" | "r" | "b" | "l";

const DOOR_WIDTH = 56;

/** Devuelve los segmentos de un muro despues de restarle sus vanos. */
function segments(start: number, end: number, doors: number[]): [number, number][] {
  let pieces: [number, number][] = [[start, end]];

  for (const at of doors) {
    const gapStart = at - DOOR_WIDTH / 2;
    const gapEnd = at + DOOR_WIDTH / 2;
    const next: [number, number][] = [];

    for (const [a, b] of pieces) {
      if (gapEnd <= a || gapStart >= b) {
        next.push([a, b]);
        continue;
      }
      if (gapStart > a) next.push([a, gapStart]);
      if (gapEnd < b) next.push([gapEnd, b]);
    }
    pieces = next;
  }

  return pieces.filter(([a, b]) => b - a > 1);
}

export function Room({ room }: { room: RoomData }) {
  const { x, y, w, h } = room;
  const color = room.glass ? sceneColors.glass : sceneColors.wall;
  const opacity = room.glass ? 0.14 : 1;

  const doorsBySide: Record<Side, number[]> = { t: [], r: [], b: [], l: [] };
  for (const door of room.doors) doorsBySide[door.side].push(door.at);

  const walls: { key: string; pos: [number, number, number]; size: [number, number, number] }[] = [];

  for (const [from, to] of segments(x, x + w, doorsBySide.t)) {
    walls.push({
      key: `t-${from}`,
      pos: [wx((from + to) / 2), WALL_HEIGHT / 2, wz(y)],
      size: [to - from, WALL_HEIGHT, WALL_THICKNESS],
    });
  }
  for (const [from, to] of segments(x, x + w, doorsBySide.b)) {
    walls.push({
      key: `b-${from}`,
      pos: [wx((from + to) / 2), WALL_HEIGHT / 2, wz(y + h)],
      size: [to - from, WALL_HEIGHT, WALL_THICKNESS],
    });
  }
  for (const [from, to] of segments(y, y + h, doorsBySide.l)) {
    walls.push({
      key: `l-${from}`,
      pos: [wx(x), WALL_HEIGHT / 2, wz((from + to) / 2)],
      size: [WALL_THICKNESS, WALL_HEIGHT, to - from],
    });
  }
  for (const [from, to] of segments(y, y + h, doorsBySide.r)) {
    walls.push({
      key: `r-${from}`,
      pos: [wx(x + w), WALL_HEIGHT / 2, wz((from + to) / 2)],
      size: [WALL_THICKNESS, WALL_HEIGHT, to - from],
    });
  }

  return (
    <group>
      {/* piso */}
      <mesh position={[wx(x + w / 2), 0, wz(y + h / 2)]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial color={room.floor} roughness={0.95} />
      </mesh>

      {/* zocalo de acento en el motor de automatizacion */}
      {room.motor ? (
        <mesh position={[wx(x + w / 2), 0.6, wz(y + h / 2)]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.min(w, h) / 2 - 6, Math.min(w, h) / 2 - 3, 4]} />
          <meshBasicMaterial color={furniture.screenOn} transparent opacity={0.5} />
        </mesh>
      ) : null}

      {walls.map((wall) => (
        <mesh key={wall.key} position={wall.pos} castShadow receiveShadow>
          <boxGeometry args={wall.size} />
          <meshStandardMaterial
            color={color}
            roughness={0.85}
            transparent={room.glass}
            opacity={opacity}
          />
        </mesh>
      ))}

      <Html
        position={[wx(x + w / 2), 2, wz(y + h / 2)]}
        center
        distanceFactor={620}
        pointerEvents="none"
        zIndexRange={[10, 0]}
      >
        <span className="text-altec-cream/45 font-mono text-[10px] tracking-[0.18em] whitespace-nowrap uppercase select-none">
          {room.name}
        </span>
      </Html>
    </group>
  );
}
