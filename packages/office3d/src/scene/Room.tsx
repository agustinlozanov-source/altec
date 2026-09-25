"use client";

import type { Room as RoomData } from "../layouts/default";
import { useSceneTheme } from "../themes";
import { wx, wz } from "./coords";

/**
 * Una sala: piso, muros con sus vanos, remate superior y etiqueta.
 * Todo el color viene del tema; este componente solo dibuja.
 */

type Side = "t" | "r" | "b" | "l";

/** Devuelve los tramos de muro que quedan tras restarle los vanos. */
function segments(start: number, end: number, doors: number[], doorWidth: number): [number, number][] {
  let pieces: [number, number][] = [[start, end]];

  for (const at of doors) {
    const gapStart = at - doorWidth / 2;
    const gapEnd = at + doorWidth / 2;
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
  const theme = useSceneTheme();
  const { x, y, w, h } = room;
  const { walls } = theme;

  const height = room.glass ? walls.glassHeight : walls.height;
  const bodyColor = room.glass ? walls.glass : room.human ? walls.human : walls.solid;
  const trimColor = room.glass
    ? walls.glassTrim
    : room.human
      ? walls.trimHuman
      : room.motor
        ? walls.trimMotor
        : walls.trim;

  const floor = theme.rooms.floors[room.id] ?? theme.rooms.floorFallback;

  const doorsBySide: Record<Side, number[]> = { t: [], r: [], b: [], l: [] };
  for (const door of room.doors) doorsBySide[door.side].push(door.at);

  const pieces: { key: string; pos: [number, number, number]; size: [number, number, number] }[] = [];
  const t = walls.thickness;

  for (const [from, to] of segments(x, x + w, doorsBySide.t, walls.doorWidth)) {
    pieces.push({ key: `t-${from}`, pos: [wx((from + to) / 2), 0, wz(y)], size: [to - from, height, t] });
  }
  for (const [from, to] of segments(x, x + w, doorsBySide.b, walls.doorWidth)) {
    pieces.push({ key: `b-${from}`, pos: [wx((from + to) / 2), 0, wz(y + h)], size: [to - from, height, t] });
  }
  for (const [from, to] of segments(y, y + h, doorsBySide.l, walls.doorWidth)) {
    pieces.push({ key: `l-${from}`, pos: [wx(x), 0, wz((from + to) / 2)], size: [t, height, to - from] });
  }
  for (const [from, to] of segments(y, y + h, doorsBySide.r, walls.doorWidth)) {
    pieces.push({ key: `r-${from}`, pos: [wx(x + w), 0, wz((from + to) / 2)], size: [t, height, to - from] });
  }

  const trimHeight = room.glass ? 2 : 1.6;

  return (
    <group>
      <mesh position={[wx(x + w / 2), 0.6, wz(y + h / 2)]} receiveShadow>
        <boxGeometry args={[w, 1.2, h]} />
        <meshStandardMaterial
          color={floor}
          roughness={room.motor ? 0.5 : 0.85}
        />
      </mesh>

      {/* tapete de la sala de juntas */}
      {room.id === "junta" ? (
        <mesh position={[wx(x + w / 2), 1.35, wz(y + h / 2)]} receiveShadow>
          <boxGeometry args={[300, 0.3, 150]} />
          <meshStandardMaterial color={theme.furniture.meetingCarpet} roughness={0.95} />
        </mesh>
      ) : null}

      {pieces.map((piece) => (
        <group key={piece.key}>
          <mesh position={[piece.pos[0], height / 2, piece.pos[2]]} castShadow={!room.glass} receiveShadow>
            <boxGeometry args={piece.size} />
            <meshStandardMaterial
              color={bodyColor}
              roughness={room.glass ? 0.1 : 0.82}
              transparent={room.glass}
              opacity={room.glass ? walls.glassOpacity : 1}
            />
          </mesh>
          <mesh position={[piece.pos[0], height + trimHeight / 2, piece.pos[2]]}>
            <boxGeometry args={[piece.size[0] + 0.2, trimHeight, piece.size[2] + 0.2]} />
            <meshStandardMaterial color={trimColor} roughness={0.7} />
          </mesh>
        </group>
      ))}

    </group>
  );
}
