"use client";

import { furniture } from "../palette";
import { meetingTable, spots, type Spot } from "../layouts/default";
import { wx, wz } from "./coords";

/** Escritorio con monitor. El monitor se enciende cuando su dueno trabaja (§8.3). */
export function Desk({ spot, lit = false }: { spot: Spot; lit?: boolean }) {
  const [x, y] = spot.at;
  const vacant = spot.kind === "vacant";

  return (
    <group position={[wx(x), 0, wz(y)]}>
      <mesh position={[0, 13, -12]} castShadow receiveShadow>
        <boxGeometry args={[46, 2.5, 26]} />
        <meshStandardMaterial
          color={vacant ? furniture.vacant : furniture.desk}
          roughness={0.8}
          transparent={vacant}
          opacity={vacant ? 0.28 : 1}
        />
      </mesh>

      {!vacant ? (
        <>
          <mesh position={[-20, 6.5, -12]}>
            <boxGeometry args={[2, 13, 22]} />
            <meshStandardMaterial color={furniture.deskLegs} roughness={0.9} />
          </mesh>
          <mesh position={[20, 6.5, -12]}>
            <boxGeometry args={[2, 13, 22]} />
            <meshStandardMaterial color={furniture.deskLegs} roughness={0.9} />
          </mesh>

          <mesh position={[0, 21, -18]} castShadow>
            <boxGeometry args={[18, 10.5, 1.5]} />
            <meshStandardMaterial
              color={lit ? furniture.screenOn : furniture.screenOff}
              emissive={lit ? furniture.screenOn : "#000000"}
              emissiveIntensity={lit ? 0.3 : 0}
              roughness={0.5}
            />
          </mesh>
        </>
      ) : null}
    </group>
  );
}

/** Mesa ovalada de 12 asientos, con pizarron (§8.2). */
export function MeetingTable({ title }: { title?: string }) {
  const [cx, cy] = meetingTable.center;
  return (
    <group>
      <mesh position={[wx(cx), 12, wz(cy)]} scale={[meetingTable.rx, 1, meetingTable.ry]} castShadow receiveShadow>
        <cylinderGeometry args={[1, 1, 24, 48]} />
        <meshStandardMaterial color={furniture.table} roughness={0.6} />
      </mesh>
      <mesh position={[wx(cx), 30, wz(cy - 118)]} castShadow>
        <boxGeometry args={[180, 46, 2]} />
        <meshStandardMaterial
          color={title ? furniture.screenOn : furniture.board}
          emissive={title ? furniture.screenOn : "#000000"}
          emissiveIntensity={title ? 0.25 : 0}
          roughness={0.8}
        />
      </mesh>
    </group>
  );
}

/** Todo el mobiliario fijo que sale del layout. */
export function StaticFurniture({ litDesks }: { litDesks: ReadonlySet<string> }) {
  const desks = spots.filter((s) => s.kind === "desk" || s.kind === "vacant");

  return (
    <group>
      {desks.map((spot) => (
        <Desk key={spot.id} spot={spot} lit={litDesks.has(spot.id)} />
      ))}
    </group>
  );
}
