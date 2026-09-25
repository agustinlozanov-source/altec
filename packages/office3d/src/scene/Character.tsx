"use client";

import { Html } from "@react-three/drei";
import type { Look } from "@altec/agents";
import { useSceneTheme } from "../themes";
import { wx, wz } from "./coords";

/**
 * Personaje low-poly construido con geometria (§8.3).
 *
 * No usa modelos GLB: las formas simples encajan mejor con el estilo de marca,
 * se colorean directo desde los tokens y no dependen de descargar assets ni de
 * licencias externas. Si mas adelante se quieren modelos con animaciones, este
 * componente se reemplaza sin tocar nada mas.
 */

export type CharacterProps = {
  at: readonly [number, number];
  look: Look;
  state: "working" | "meeting" | "collab" | "awaiting" | "idle";
  name: string;
  /** Angulo en radianes hacia donde mira. */
  heading?: number;
  say?: string;
  selected?: boolean;
  onSelect?: () => void;
};

export function Character({
  at,
  look,
  state,
  name,
  heading = 0,
  say,
  selected = false,
  onSelect,
}: CharacterProps) {
  const theme = useSceneTheme();
  const ring = theme.state[state];
  const awaiting = state === "awaiting";
  const { ringInner, ringOuter } = theme.character;

  return (
    <group position={[wx(at[0]), 0, wz(at[1])]} rotation={[0, heading, 0]}>
      {/* aro de estado en el piso (§8.3) */}
      <mesh position={[0, 0.8, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[ringInner, selected ? ringOuter + 1.5 : ringOuter, 32]} />
        <meshBasicMaterial color={ring} transparent opacity={awaiting ? 0.95 : 0.7} />
      </mesh>

      {/* piernas */}
      <mesh position={[0, 9, 0]} castShadow>
        <cylinderGeometry args={[5.2, 6, 18, 10]} />
        <meshStandardMaterial color={look.wear} roughness={0.9} />
      </mesh>

      {/* torso */}
      <mesh position={[0, 24, 0]} castShadow>
        <capsuleGeometry args={[6.4, 12, 4, 12]} />
        <meshStandardMaterial color={look.wear} roughness={0.85} />
      </mesh>

      {/* acento: banda de color sobre el torso */}
      {look.accent ? (
        <mesh position={[0, 27, 0]} castShadow>
          <cylinderGeometry args={[6.6, 6.6, 3.5, 12]} />
          <meshStandardMaterial color={look.accent} roughness={0.7} />
        </mesh>
      ) : null}

      {/* cabeza */}
      <mesh position={[0, 38, 0]} castShadow>
        <sphereGeometry args={[5.4, 14, 12]} />
        <meshStandardMaterial color={look.skin} roughness={0.9} />
      </mesh>

      {/* cabello */}
      <mesh position={[0, look.longHair ? 38.5 : 40, look.longHair ? -1 : 0]} castShadow>
        <sphereGeometry args={[look.longHair ? 5.9 : 5.5, 14, 12, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
        <meshStandardMaterial color={look.hair} roughness={1} />
      </mesh>

      {/* zona clicable, invisible */}
      <mesh
        position={[0, 24, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
        visible={false}
      >
        <cylinderGeometry args={[11, 11, 50, 8]} />
      </mesh>

      {/* signo de admiracion cuando espera decision (§8.3) */}
      {awaiting ? (
        <Html position={[0, 56, 0]} center distanceFactor={420} pointerEvents="none">
          <span className="text-xl leading-none font-bold select-none"
            style={{ color: ring }}>!</span>
        </Html>
      ) : null}

      <Html position={[0, -2, 14]} center distanceFactor={560} pointerEvents="none" zIndexRange={[20, 0]}>
        <span className="text-[10px] whitespace-nowrap text-white/80 select-none">{name}</span>
      </Html>

      {say ? (
        <Html position={[0, 50, 0]} center distanceFactor={420} pointerEvents="none" zIndexRange={[30, 0]}>
          <span className="max-w-[180px] rounded-md bg-white px-2 py-1 text-[10px] leading-snug whitespace-normal text-black shadow-lg select-none">
            {say}
          </span>
        </Html>
      ) : null}
    </group>
  );
}
