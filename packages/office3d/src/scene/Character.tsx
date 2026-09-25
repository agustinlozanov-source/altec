"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Group, Mesh, MeshBasicMaterial } from "three";
import { useSceneTheme } from "../themes";
import { isSitting, isTyping, type Person } from "../runtime/people";
import { wx, wz } from "./coords";

/**
 * Figura articulada, portada de `makeFigure` en
 * `docs/referencias/oficina-3d.html`. Mismas proporciones y misma jerarquia:
 * caderas -> piernas con pivote y zapatos, torso, corbata, brazos con manos,
 * cabeza con craneo, pelo y ojos.
 *
 * Se anima en `useFrame` leyendo el modelo mutable de `runtime/people`, no por
 * estado de React: la posicion cambia sesenta veces por segundo.
 */

export function Character({
  person,
  selected = false,
  onSelect,
}: {
  person: Person;
  selected?: boolean;
  onSelect?: () => void;
}) {
  const theme = useSceneTheme();
  const group = useRef<Group>(null);
  const hips = useRef<Group>(null);
  const legL = useRef<Group>(null);
  const legR = useRef<Group>(null);
  const armL = useRef<Group>(null);
  const armR = useRef<Group>(null);
  const head = useRef<Group>(null);
  const ring = useRef<Mesh>(null);
  const glow = useRef<Mesh>(null);

  const { look } = person;
  const pants = look.pants ?? "#27343a";

  useFrame((_, delta) => {
    const g = group.current;
    const hip = hips.current;
    if (!g || !hip) return;

    g.position.set(wx(person.x), 0, wz(person.y));

    // El rumbo persigue al objetivo en vez de saltar.
    const diff = ((person.dir - person.heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    person.heading += diff * Math.min(1, delta * 10);
    g.rotation.y = person.heading;

    const ph = person.phase * 10;
    const now = performance.now() / 1000;
    const sitting = isSitting(person);

    if (person.moving) {
      const s = Math.sin(ph);
      if (legL.current) legL.current.rotation.x = s * 0.65;
      if (legR.current) legR.current.rotation.x = -s * 0.65;
      if (armL.current) armL.current.rotation.x = -s * 0.5;
      if (armR.current) armR.current.rotation.x = s * 0.5;
      hip.position.y = Math.abs(Math.cos(ph)) * 1.3;
    } else if (sitting) {
      if (legL.current) legL.current.rotation.x = -Math.PI / 2;
      if (legR.current) legR.current.rotation.x = -Math.PI / 2;
      hip.position.y = -1;

      if (isTyping(person)) {
        if (armL.current) armL.current.rotation.x = -1.05 + Math.sin(now * 16) * 0.08;
        if (armR.current) armR.current.rotation.x = -1.05 + Math.sin(now * 16 + 1.7) * 0.08;
      } else if (person.bubble) {
        if (armL.current) armL.current.rotation.x = -0.9 + Math.sin(now * 5) * 0.35;
        if (armR.current) armR.current.rotation.x = -0.5;
      } else {
        if (armL.current) armL.current.rotation.x = -0.55;
        if (armR.current) armR.current.rotation.x = -0.55;
      }
    } else {
      if (legL.current) legL.current.rotation.x = 0;
      if (legR.current) legR.current.rotation.x = 0;
      hip.position.y = 0;
      if (person.bubble) {
        if (armR.current) armR.current.rotation.x = -1 + Math.sin(now * 5) * 0.4;
        if (armL.current) armL.current.rotation.x = 0;
      } else {
        if (armL.current) armL.current.rotation.x = 0;
        if (armR.current) armR.current.rotation.x = 0;
      }
    }

    if (head.current) {
      head.current.rotation.y = person.bubble ? Math.sin(performance.now() / 700) * 0.15 : 0;
    }

    if (person.kind === "agent" && ring.current && glow.current) {
      const ringMat = ring.current.material as MeshBasicMaterial;
      ringMat.color.set(
        person.moving && person.state !== "awaiting" ? "#8aa9ab" : theme.state[person.state],
      );
      const glowMat = glow.current.material as MeshBasicMaterial;
      glowMat.opacity =
        person.state === "awaiting" ? 0.25 + 0.2 * Math.sin(performance.now() / 180) : 0;
      const s = selected ? 1.25 : 1;
      ring.current.scale.set(s, s, s);
    }
  });

  const ringColor =
    person.kind === "human"
      ? theme.state.awaiting
      : person.kind === "visitor"
        ? "#7f8b8e"
        : theme.state.working;

  return (
    <group ref={group}>
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.6, 0]}>
        <ringGeometry args={[11, 13.5, 40]} />
        <meshBasicMaterial color={ringColor} transparent opacity={0.95} depthWrite={false} />
      </mesh>
      <mesh ref={glow} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.4, 0]}>
        <circleGeometry args={[20, 40]} />
        <meshBasicMaterial
          color={theme.state.awaiting}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      <group ref={hips}>
        {/* piernas con pivote y zapatos */}
        {([
          [-3.2, legL],
          [3.2, legR],
        ] as const).map(([x, ref], i) => (
          <group key={i} ref={ref} position={[x, 14, 0]}>
            <mesh position={[0, -7, 0]} castShadow>
              <boxGeometry args={[4.6, 14, 4.6]} />
              <meshStandardMaterial color={pants} roughness={0.7} flatShading />
            </mesh>
            <mesh position={[0, -13.2, 1]} castShadow>
              <boxGeometry args={[4.8, 2.4, 6.5]} />
              <meshStandardMaterial color="#1b2226" roughness={0.7} flatShading />
            </mesh>
          </group>
        ))}

        {/* torso */}
        <mesh position={[0, 22, 0]} castShadow onClick={(e) => { e.stopPropagation(); onSelect?.(); }}>
          <cylinderGeometry args={[6.2, 7.2, 16, 8]} />
          <meshStandardMaterial color={look.wear} roughness={0.7} flatShading />
        </mesh>

        {look.accent ? (
          <mesh position={[0, 24, 6.6]} rotation={[-0.06, 0, 0]}>
            <boxGeometry args={[1.8, 9, 0.8]} />
            <meshStandardMaterial color={look.accent} roughness={0.7} flatShading />
          </mesh>
        ) : null}

        {/* brazos con manos */}
        {([
          [-8.4, armL],
          [8.4, armR],
        ] as const).map(([x, ref], i) => (
          <group key={i} ref={ref} position={[x, 29, 0]}>
            <mesh position={[0, -6, 0]} castShadow>
              <boxGeometry args={[3.6, 12.5, 3.6]} />
              <meshStandardMaterial color={look.wear} roughness={0.7} flatShading />
            </mesh>
            <mesh position={[0, -13, 0]}>
              <icosahedronGeometry args={[2.2, 0]} />
              <meshStandardMaterial color={look.skin} roughness={0.7} flatShading />
            </mesh>
          </group>
        ))}

        {/* cabeza */}
        <group ref={head} position={[0, 37.5, 0]}>
          <mesh castShadow onClick={(e) => { e.stopPropagation(); onSelect?.(); }}>
            <icosahedronGeometry args={[6.6, 1]} />
            <meshStandardMaterial color={look.skin} roughness={0.7} flatShading />
          </mesh>
          <mesh position={[0, 0.7, -0.6]} rotation={[-0.25, 0, 0]}>
            <sphereGeometry args={[7.1, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
            <meshStandardMaterial color={look.hair} roughness={0.7} flatShading />
          </mesh>
          {look.longHair ? (
            <mesh position={[0, -4, -4.4]}>
              <boxGeometry args={[13, 12, 4]} />
              <meshStandardMaterial color={look.hair} roughness={0.7} flatShading />
            </mesh>
          ) : null}
          {[-2.4, 2.4].map((x) => (
            <mesh key={x} position={[x, 0.6, 6.3]}>
              <boxGeometry args={[1.2, 1.6, 0.6]} />
              <meshStandardMaterial color="#1b2226" roughness={0.7} flatShading />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}
