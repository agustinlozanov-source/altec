"use client";

import { roster, human } from "@altec/agents";
import type { AgentRuntime } from "@altec/events";
import { lighting, scene as sceneColors } from "../palette";
import { rooms, spotById } from "../layouts/default";
import { Character } from "./Character";
import { StaticFurniture, MeetingTable } from "./Furniture";
import { Room } from "./Room";
import { wx, wz } from "./coords";

/**
 * Contenido de la escena. Solo dibuja lo que el estado le pasa: no decide nada
 * (docs/ALTEC-VO.md §2, principio 1).
 */

export type OfficeSceneProps = {
  agents: Record<string, AgentRuntime>;
  meetingTitle?: string;
  selectedAgent?: string | null;
  onSelectAgent?: (key: string | null) => void;
};

export function OfficeScene({
  agents,
  meetingTitle,
  selectedAgent,
  onSelectAgent,
}: OfficeSceneProps) {
  const litDesks = new Set(
    roster
      .filter((a) => {
        const runtime = agents[a.key];
        return !runtime || runtime.state === "working";
      })
      .map((a) => a.home),
  );

  const socio = rooms.find((r) => r.human);

  return (
    <group>
      {/* suelo general, mas alla de las salas */}
      <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3200, 2400]} />
        <meshStandardMaterial color={sceneColors.ground} roughness={1} />
      </mesh>

      <ambientLight intensity={0.55} color={lighting.hemiSky} />
      <hemisphereLight args={[lighting.hemiSky, lighting.hemiGround, 1.15]} />
      <directionalLight
        position={[-260, 420, -180]}
        intensity={2.1}
        color={lighting.sun}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-700}
        shadow-camera-right={700}
        shadow-camera-top={500}
        shadow-camera-bottom={-500}
        shadow-camera-far={1200}
      />

      {/* la oficina del socio se distingue por su luz calida (§8.2) */}
      {socio ? (
        <pointLight
          position={[wx(socio.x + socio.w / 2), 70, wz(socio.y + socio.h / 2)]}
          intensity={2.4}
          distance={320}
          decay={1.5}
          color={lighting.human}
        />
      ) : null}

      {rooms.map((room) => (
        <Room key={room.id} room={room} />
      ))}

      <MeetingTable title={meetingTitle} />
      <StaticFurniture litDesks={litDesks} />

      {roster.map((agent) => {
        const runtime = agents[agent.key];
        const spotId = runtime?.spot ?? agent.home;
        const spot = spotById.get(spotId) ?? spotById.get(agent.home);
        if (!spot) return null;

        const heading = spot.look
          ? Math.atan2(spot.look[0] - spot.at[0], spot.look[1] - spot.at[1])
          : 0;

        return (
          <Character
            key={agent.key}
            at={spot.at}
            look={agent.look}
            state={runtime?.state ?? "working"}
            name={agent.shortName}
            heading={heading}
            {...(runtime?.say ? { say: runtime.say } : {})}
            selected={selectedAgent === agent.key}
            onSelect={() => onSelectAgent?.(selectedAgent === agent.key ? null : agent.key)}
          />
        );
      })}

      {/* el humano, en su oficina */}
      {(() => {
        const spot = spotById.get(human.home);
        if (!spot) return null;
        return (
          <Character
            at={spot.at}
            look={human.look}
            state="idle"
            name={human.shortName}
            heading={Math.PI}
          />
        );
      })()}
    </group>
  );
}
