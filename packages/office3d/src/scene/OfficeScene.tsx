"use client";

import { roster, human } from "@altec/agents";
import type { AgentRuntime } from "@altec/events";
import { rooms, spotById } from "../layouts/default";
import { useSceneTheme } from "../themes";
import { Character } from "./Character";
import { StaticFurniture, MeetingRoom } from "./Furniture";
import { Room } from "./Room";
import { wx, wz } from "./coords";

/**
 * Contenido de la escena. Solo dibuja lo que el estado le pasa: no decide nada
 * (docs/ALTEC-VO.md §2, principio 1). El color lo pone el tema.
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
  const theme = useSceneTheme();
  const { lighting } = theme;

  const litDesks = new Set(
    roster
      .filter((a) => {
        const runtime = agents[a.key];
        return !runtime || runtime.state === "working";
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
