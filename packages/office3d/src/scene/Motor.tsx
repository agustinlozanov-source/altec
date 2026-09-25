"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Color, InstancedMesh, Matrix4 } from "three";
import { useSceneTheme } from "../themes";
import type { Simulation } from "../runtime/sim";
import { wx, wz } from "./coords";

/**
 * Motor de automatizacion (docs/ALTEC-VO.md §8.2): tres bandas por donde pasa
 * cada tarea automatizada como un cubo del color del agente que la origino.
 * Portado de `docs/referencias/oficina-3d.html`.
 */

export const BELT_Y = [598, 631, 664] as const;
const MAX_CHIPS = 120;

export function Motor({ sim }: { sim: Simulation }) {
  const theme = useSceneTheme();
  const mesh = useRef<InstancedMesh>(null);
  const matrix = useMemo(() => new Matrix4(), []);
  const color = useMemo(() => new Color(), []);
  const accent = theme.walls.trimMotor;

  useFrame(() => {
    const instanced = mesh.current;
    if (!instanced) return;

    let i = 0;
    for (const chip of sim.chips) {
      if (chip.x < 745 || i >= MAX_CHIPS) continue;
      const y = BELT_Y[chip.lane] ?? BELT_Y[1];
      matrix.makeRotationY(chip.x * 0.02);
      matrix.setPosition(wx(chip.x), 11, wz(y as number));
      instanced.setMatrixAt(i, matrix);
      instanced.setColorAt(i, color.set(chip.color));
      i += 1;
    }

    // Las sobrantes se esconden lejos de la camara.
    for (; i < MAX_CHIPS; i += 1) {
      matrix.makeScale(0, 0, 0);
      matrix.setPosition(0, -9999, 0);
      instanced.setMatrixAt(i, matrix);
    }

    instanced.count = MAX_CHIPS;
    instanced.instanceMatrix.needsUpdate = true;
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      {BELT_Y.map((y) => (
        <group key={y}>
          <mesh position={[wx(952), 4, wz(y)]} receiveShadow>
            <boxGeometry args={[415, 8, 14]} />
            <meshStandardMaterial color="#132024" roughness={0.6} />
          </mesh>
          {[-7.5, 7.5].map((offset) => (
            <mesh key={offset} position={[wx(952), 8.6, wz(y + offset)]}>
              <boxGeometry args={[415, 1.2, 1]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1} />
            </mesh>
          ))}
        </group>
      ))}

      {/* postes de entrada y salida */}
      <mesh position={[wx(742), 12, wz(631)]} castShadow>
        <boxGeometry args={[14, 24, 80]} />
        <meshStandardMaterial color="#2a3236" roughness={0.7} />
      </mesh>
      <mesh position={[wx(1166), 12, wz(631)]} castShadow>
        <boxGeometry args={[14, 24, 80]} />
        <meshStandardMaterial color="#2a3236" roughness={0.7} />
      </mesh>
      <mesh position={[wx(1166), 17.5, wz(631)]}>
        <boxGeometry args={[15, 3, 60]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} />
      </mesh>

      <instancedMesh ref={mesh} args={[undefined, undefined, MAX_CHIPS]} castShadow>
        <boxGeometry args={[9, 6, 9]} />
        <meshStandardMaterial roughness={0.5} />
      </instancedMesh>
    </group>
  );
}
