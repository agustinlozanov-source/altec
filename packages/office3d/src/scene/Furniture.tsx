"use client";

import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import { meetingTable, spots, type Point, type Spot } from "../layouts/default";
import { useSceneTheme } from "../themes";
import { wx, wz } from "./coords";

/**
 * Mobiliario de la oficina, portado del prototipo
 * (docs/referencias/oficina-3d.html). Las medidas son las mismas; el color
 * sale del tema.
 */

function rotationToward(from: Point, look?: Point) {
  if (!look) return 0;
  return Math.atan2(look[0] - from[0], look[1] - from[1]);
}

/** Silla de oficina: base de cinco patas, poste, asiento y respaldo. */
export function Chair({
  at,
  look,
  tone = "chair",
}: {
  at: Point;
  look?: Point;
  tone?: "chair" | "chairExec" | "chairVisitor";
}) {
  const { furniture } = useSceneTheme();
  return (
    <group position={[wx(at[0]), 0, wz(at[1])]} rotation={[0, rotationToward(at, look), 0]}>
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[7, 7, 1.5, 12]} />
        <meshStandardMaterial color={furniture.chairBase} roughness={0.8} />
      </mesh>
      <mesh position={[0, 5.5, 0]} castShadow>
        <cylinderGeometry args={[1.4, 1.4, 11, 8]} />
        <meshStandardMaterial color={furniture.chairPost} roughness={0.6} />
      </mesh>
      <mesh position={[0, 12.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[16, 3, 16]} />
        <meshStandardMaterial color={furniture[tone]} roughness={0.85} />
      </mesh>
      <mesh position={[0, 21, -8]} castShadow>
        <boxGeometry args={[16, 17, 3]} />
        <meshStandardMaterial color={furniture[tone]} roughness={0.85} />
      </mesh>
    </group>
  );
}

/** Monitor con base y pantalla. Se enciende cuando su dueno trabaja (§8.3). */
export function Monitor({ at, lit = false }: { at: Point; lit?: boolean }) {
  const { furniture } = useSceneTheme();
  return (
    <group position={[wx(at[0]), 0, wz(at[1])]}>
      <mesh position={[0, 27.5, 0]} castShadow>
        <boxGeometry args={[3, 6, 3]} />
        <meshStandardMaterial color={furniture.monitorStand} roughness={0.7} />
      </mesh>
      <mesh position={[0, 37.5, -1]} castShadow>
        <boxGeometry args={[26, 15, 2]} />
        <meshStandardMaterial color={furniture.monitorBody} roughness={0.7} />
      </mesh>
      <mesh position={[0, 37.5, 0.2]}>
        <planeGeometry args={[23, 12.5]} />
        <meshBasicMaterial color={lit ? furniture.screenOn : furniture.screenOff} />
      </mesh>
    </group>
  );
}

/** Escritorio de trabajo: tablero, patas, teclado, raton, monitor y silla. */
/**
 * Distancia entre el escritorio y quien lo ocupa. En el prototipo el
 * escritorio se dibuja en `y` y la silla en `y + 28`, y el agente se sienta en
 * la silla. El `spot` del layout es la posicion del AGENTE, asi que el
 * escritorio va 28 unidades delante y la silla justo bajo el agente.
 */
const SEAT_OFFSET = 28;

export function Desk({ spot, lit = false }: { spot: Spot; lit?: boolean }) {
  const { furniture } = useSceneTheme();
  const [x, seatY] = spot.at;
  const y = seatY - SEAT_OFFSET;
  const vacant = spot.kind === "vacant";

  if (vacant) {
    return (
      <group position={[wx(x), 0, wz(y)]}>
        <mesh position={[0, 23.25, 0]}>
          <boxGeometry args={[66, 2.5, 28]} />
          <meshStandardMaterial
            color={furniture.vacant}
            roughness={0.8}
            transparent
            opacity={furniture.vacantOpacity}
          />
        </mesh>
      </group>
    );
  }

  return (
    <group>
      <group position={[wx(x), 0, wz(y)]}>
        <mesh position={[0, 23.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[66, 2.5, 28]} />
          <meshStandardMaterial color={furniture.deskTop} roughness={0.8} />
        </mesh>
        <mesh position={[-30, 11, 0]} castShadow>
          <boxGeometry args={[3, 22, 24]} />
          <meshStandardMaterial color={furniture.deskLeg} roughness={0.8} />
        </mesh>
        <mesh position={[30, 11, 0]} castShadow>
          <boxGeometry args={[3, 22, 24]} />
          <meshStandardMaterial color={furniture.deskLeg} roughness={0.8} />
        </mesh>
        {/* teclado y raton */}
        <mesh position={[0, 25, 4]}>
          <boxGeometry args={[18, 1, 6]} />
          <meshStandardMaterial color={furniture.keyboard} roughness={0.9} />
        </mesh>
        <mesh position={[14, 24.9, 5]}>
          <boxGeometry args={[5, 0.8, 7]} />
          <meshStandardMaterial color={furniture.keyboard} roughness={0.9} />
        </mesh>
      </group>
      <Monitor at={[x, y - 6]} lit={lit} />
      <Chair at={[x, seatY]} look={[x, y]} />
    </group>
  );
}

/** Escritorio de direccion: madera, mas ancho, con su silla ejecutiva. */
export function ExecDesk({ at, seat }: { at: Point; seat: Point }) {
  const { furniture } = useSceneTheme();
  const [x, y] = at;
  return (
    <group>
      <group position={[wx(x), 0, wz(y)]}>
        <mesh position={[0, 23.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[110, 3, 34]} />
          <meshStandardMaterial color={furniture.execDesk} roughness={0.6} />
        </mesh>
        <mesh position={[-50, 11, 0]} castShadow>
          <boxGeometry args={[4, 22, 30]} />
          <meshStandardMaterial color={furniture.execDeskLeg} roughness={0.8} />
        </mesh>
        <mesh position={[50, 11, 0]} castShadow>
          <boxGeometry args={[4, 22, 30]} />
          <meshStandardMaterial color={furniture.execDeskLeg} roughness={0.8} />
        </mesh>
      </group>
      <Monitor at={[x, y - 6]} lit />
      <Chair at={seat} look={at} tone="chairExec" />
    </group>
  );
}

/** Maceta con follaje low-poly. */
export function Plant({ at, scale = 1 }: { at: Point; scale?: number }) {
  const { furniture } = useSceneTheme();
  const s = scale;
  return (
    <group position={[wx(at[0]), 0, wz(at[1])]}>
      <mesh position={[0, 5 * s, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[6 * s, 5 * s, 10 * s, 10]} />
        <meshStandardMaterial color={furniture.plantPot} roughness={0.9} />
      </mesh>
      <mesh position={[0, 19 * s, 0]} castShadow>
        <icosahedronGeometry args={[11 * s, 0]} />
        <meshStandardMaterial color={furniture.leafDark} roughness={0.9} flatShading />
      </mesh>
      <mesh position={[4 * s, 28 * s, -2 * s]} castShadow>
        <icosahedronGeometry args={[7 * s, 0]} />
        <meshStandardMaterial color={furniture.leafLight} roughness={0.9} flatShading />
      </mesh>
    </group>
  );
}

/** Librero con lomos de colores. */
export function Shelf({ at, width }: { at: Point; width: number }) {
  const { furniture } = useSceneTheme();
  const count = Math.floor(width / 9);
  return (
    <group position={[wx(at[0]), 0, wz(at[1])]}>
      <mesh position={[0, 15, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, 30, 10]} />
        <meshStandardMaterial color={furniture.shelf} roughness={0.85} />
      </mesh>
      {Array.from({ length: count }, (_, i) => {
        const h = 8 + (i % 3) * 2;
        return (
          <mesh key={i} position={[-width / 2 + 6 + i * 9, 31 + h / 2, 1]} castShadow>
            <boxGeometry args={[6, h, 8]} />
            <meshStandardMaterial
              color={furniture.books[i % furniture.books.length]}
              roughness={0.9}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/** Sofa recto del lounge. */
export function Sofa({ at, size }: { at: Point; size: [number, number] }) {
  const { furniture } = useSceneTheme();
  const [w, d] = size;
  return (
    <group position={[wx(at[0]), 0, wz(at[1])]}>
      <mesh position={[0, 5, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, 10, d]} />
        <meshStandardMaterial color={furniture.sofa} roughness={0.95} />
      </mesh>
      <mesh position={[0, 11, -d / 2 + 4]} castShadow>
        <boxGeometry args={[w, 22, 8]} />
        <meshStandardMaterial color={furniture.sofa} roughness={0.95} />
      </mesh>
    </group>
  );
}

/** Pizarron de la sala de juntas: muestra el titulo de la junta activa. */
export function MeetingBoard({ title }: { title?: string }) {
  const theme = useSceneTheme();

  const { texture, draw } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 154;
    const ctx = canvas.getContext("2d");
    const tex = new CanvasTexture(canvas);
    tex.colorSpace = SRGBColorSpace;

    const render = (text: string | undefined, t: typeof theme) => {
      if (!ctx) return;
      ctx.fillStyle = text ? t.board.activeBackground : t.board.idleBackground;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = text ? t.board.activeText : t.board.idleText;
      ctx.font = '600 58px "Inter", system-ui, sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text || "Sala disponible", canvas.width / 2, canvas.height / 2, canvas.width - 60);
      ctx.fillStyle = t.board.accent;
      ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
      tex.needsUpdate = true;
    };

    return { texture: tex, draw: render };
  }, [theme]);

  useEffect(() => {
    draw(title, theme);
  }, [draw, title, theme]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh position={[wx(520), 14 + 15, wz(25)]}>
      <planeGeometry args={[200, 30]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

/** Mesa ovalada de 12 asientos con sus sillas. */
export function MeetingRoom({ title }: { title?: string }) {
  const { furniture } = useSceneTheme();
  const [cx, cy] = meetingTable.center;
  const seats = spots.filter((s) => s.room === "junta" && s.kind === "seat");

  return (
    <group>
      <mesh
        position={[wx(cx), 23.5, wz(cy)]}
        scale={[meetingTable.rx, 1, meetingTable.ry]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[1, 1, 3, 48]} />
        <meshStandardMaterial color={furniture.meetingTable} roughness={0.5} />
      </mesh>
      <mesh position={[wx(cx), 11, wz(cy)]} castShadow>
        <boxGeometry args={[120, 22, 24]} />
        <meshStandardMaterial color={furniture.meetingBase} roughness={0.8} />
      </mesh>
      {seats.map((seat) => (
        <Chair key={seat.id} at={seat.at} look={meetingTable.center} />
      ))}
      <MeetingBoard {...(title ? { title } : {})} />
    </group>
  );
}

/** Mobiliario fijo que se deduce del layout mas los remates de cada sala. */
export function StaticFurniture({ litDesks }: { litDesks: ReadonlySet<string> }) {
  const { furniture } = useSceneTheme();
  const desks = spots.filter((s) => s.kind === "desk" || s.kind === "vacant");
  const visitors = spots.filter((s) => s.kind === "seat" && s.room !== "junta");

  return (
    <group>
      {desks
        .filter((s) => s.id !== "dir.desk" && s.id !== "sp.desk" && s.id !== "socio.desk")
        .map((spot) => (
          <Desk key={spot.id} spot={spot} lit={litDesks.has(spot.id)} />
        ))}

      {/* despachos */}
      <ExecDesk at={[150, 84]} seat={[150, 112]} />
      <ExecDesk at={[150, 302]} seat={[150, 330]} />
      <ExecDesk at={[830, 50]} seat={[830, 78]} />

      {visitors.map((seat) => (
        <Chair key={seat.id} at={seat.at} look={seat.look as Point} tone="chairVisitor" />
      ))}

      <Shelf at={[215, 32]} width={90} />
      <Shelf at={[215, 252]} width={90} />

      <Plant at={[40, 200]} />
      <Plant at={[258, 400]} />
      <Plant at={[320, 40]} scale={0.9} />
      <Plant at={[680, 250]} scale={0.9} />
      <Plant at={[250, 680]} scale={1.2} />
      <Plant at={[40, 610]} scale={0.9} />

      {/* lounge */}
      <Sofa at={[110, 470]} size={[150, 30]} />
      <Sofa at={[90, 680]} size={[110, 22]} />
      <group position={[wx(140), 0, wz(605)]}>
        <mesh position={[0, 17, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[34, 34, 2, 20]} />
          <meshStandardMaterial color={furniture.loungeTable} roughness={0.7} />
        </mesh>
        <mesh position={[0, 8, 0]} castShadow>
          <cylinderGeometry args={[3, 3, 16, 8]} />
          <meshStandardMaterial color={furniture.chairPost} roughness={0.6} />
        </mesh>
      </group>
      <group position={[wx(238), 0, wz(470)]}>
        <mesh position={[0, 17, 0]} castShadow receiveShadow>
          <boxGeometry args={[40, 34, 26]} />
          <meshStandardMaterial color={furniture.coffeeMachine} roughness={0.8} />
        </mesh>
        <mesh position={[0, 26, 14]}>
          <boxGeometry args={[10, 4, 2]} />
          <meshStandardMaterial
            color={furniture.coffeeLight}
            emissive={furniture.coffeeLight}
            emissiveIntensity={0.8}
          />
        </mesh>
      </group>
    </group>
  );
}
