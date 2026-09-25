"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { roster } from "@altec/agents";
import { rooms } from "../layouts/default";
import { useSceneTheme } from "../themes";
import { createAmbientLoop, stepPerson, type Person } from "../runtime";
import { Character } from "./Character";
import { StaticFurniture, MeetingRoom } from "./Furniture";
import { Room } from "./Room";
import { wx, wz } from "./coords";

/**
 * Contenido de la escena. Solo dibuja lo que el estado le pasa: no decide nada
 * (docs/ALTEC-VO.md §2, principio 1). El color lo pone el tema.
 */

export type OfficeSceneProps = {
  people: Person[];
  meetingTitle?: string;
  selectedAgent?: string | null;
  onSelectAgent?: (key: string | null) => void;
  /** Movimiento ambiental mientras no corre el guion del dia. */
  ambient?: boolean;
};

export function OfficeScene({
  people,
  meetingTitle,
  selectedAgent,
  onSelectAgent,
  ambient = true,
}: OfficeSceneProps) {
  const theme = useSceneTheme();
  const { lighting } = theme;
  const ambientTick = useMemo(() => createAmbientLoop(people), [people]);
  const clock = useRef(0);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    clock.current += dt;
    for (const person of people) stepPerson(person, dt, theme.motion.walkSpeed);
    for (const person of people) {
      if (person.bubble && person.bubble.until < clock.current) person.bubble = null;
    }
    if (ambient) ambientTick(dt);
  });

  // Los monitores se encienden cuando su dueno esta en su lugar trabajando.
  const byId = new Map(people.map((p) => [p.id, p]));
  const litDesks = new Set(
    roster
      .filter((a) => {
        const person = byId.get(a.key);
        return person ? person.seat === a.home && person.state === "working" : true;
      })
      .map((a) => a.home),
  );

  const socio = rooms.find((r) => r.human);
  const motor = rooms.find((r) => r.motor);

  return (
    <group>
      {/* Fondo del lienzo. Va aqui y no en el style del Canvas, que R3F pisa. */}
      <color attach="background" args={[lighting.background]} />

      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3200, 2400]} />
        <meshStandardMaterial color={lighting.ground} roughness={1} />
      </mesh>

      {/* losa bajo toda la planta */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[1216, 1, 736]} />
        <meshStandardMaterial color={lighting.slab} roughness={0.9} />
      </mesh>

      <ambientLight intensity={lighting.ambientIntensity} color={lighting.hemiSky} />
      <hemisphereLight
        args={[lighting.hemiSky, lighting.hemiGround, lighting.hemiIntensity]}
      />
      <directionalLight
        position={lighting.sunPosition as unknown as [number, number, number]}
        intensity={lighting.sunIntensity}
        color={lighting.sun}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-700}
        shadow-camera-right={700}
        shadow-camera-top={500}
        shadow-camera-bottom={-500}
        shadow-camera-far={1200}
      />

      {socio ? (
        <pointLight
          position={[wx(socio.x + socio.w / 2), 70, wz(socio.y + socio.h / 2)]}
          intensity={lighting.humanIntensity}
          distance={320}
          decay={1.6}
          color={lighting.human}
        />
      ) : null}

      {motor ? (
        <pointLight
          position={[wx(motor.x + motor.w / 2), 60, wz(motor.y + motor.h / 2)]}
          intensity={lighting.accentIntensity}
          distance={340}
          decay={1.6}
          color={lighting.accent}
        />
      ) : null}

      {rooms.map((room) => (
        <Room key={room.id} room={room} />
      ))}

      <MeetingRoom {...(meetingTitle ? { title: meetingTitle } : {})} />
      <StaticFurniture litDesks={litDesks} />

      {people.map((person) => (
        <Character
          key={person.id}
          person={person}
          selected={selectedAgent === person.id}
          onSelect={() => onSelectAgent?.(selectedAgent === person.id ? null : person.id)}
        />
      ))}

    </group>
  );
}
