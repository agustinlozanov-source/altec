"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping, NoToneMapping } from "three";
import { Suspense, useEffect, useRef } from "react";
import type { RefObject } from "react";
import type { Person } from "../runtime";
import { SceneThemeProvider, studioTheme, type SceneTheme } from "../themes";
import { cameraViews, roomById, rooms, type CameraViewId } from "../layouts/default";
import { OfficeScene } from "./OfficeScene";
import { PeopleOverlay, RoomLabelsOverlay } from "./PeopleOverlay";
import { wx, wz } from "./coords";

/** Posicion de camara y objetivo para cada vista del panel (§8.4). */
function viewTarget(view: CameraViewId): {
  position: [number, number, number];
  target: [number, number, number];
} {
  const general = {
    position: [-470, 620, 760] as [number, number, number],
    target: [0, 0, 30] as [number, number, number],
  };
  if (view === "general") return general;

  const room = roomById.get(view);
  if (!room) return general;

  const cx = wx(room.x + room.w / 2);
  const cz = wz(room.y + room.h / 2);
  // Lo justo para que se lean las caras y los nombres, sin perder la sala.
  const span = Math.max(room.w, room.h);
  const dist = Math.max(span * 0.62, 190);
  return {
    position: [cx - dist * 0.55, dist * 0.78, cz + dist * 0.95],
    target: [cx, 22, cz],
  };
}

type ControlsLike = {
  object: { position: { set: (x: number, y: number, z: number) => void } };
  target: { set: (x: number, y: number, z: number) => void };
  update: () => void;
};

function CameraRig({ view }: { view: CameraViewId }) {
  const controls = useRef<ControlsLike | null>(null);

  useEffect(() => {
    const node = controls.current;
    if (!node) return;
    const { position, target } = viewTarget(view);
    node.object.position.set(...position);
    node.target.set(...target);
    node.update();
  }, [view]);

  return (
    <OrbitControls
      ref={controls as never}
      makeDefault
      enablePan={false}
      minDistance={110}
      maxDistance={1500}
      maxPolarAngle={Math.PI / 2.35}
      target={[0, 0, 40]}
    />
  );
}

export type OfficeCanvasProps = {
  people: Person[];
  view: CameraViewId;
  /** Contenedor donde se dibujan nombres y globos. */
  overlay: RefObject<HTMLDivElement | null>;
  /** Apariencia de la oficina. Por defecto, la del prototipo. */
  theme?: SceneTheme;
  meetingTitle?: string;
  selectedAgent?: string | null;
  onSelectAgent?: (key: string | null) => void;
};

export function OfficeCanvas({
  people,
  view,
  overlay,
  theme = studioTheme,
  meetingTitle,
  selectedAgent,
  onSelectAgent,
}: OfficeCanvasProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      gl={{
        toneMapping: theme.lighting.toneMapping === "none" ? NoToneMapping : ACESFilmicToneMapping,
      }}
      camera={{ position: [-470, 620, 760], fov: 34, near: 1, far: 4000 }}
      onPointerMissed={() => onSelectAgent?.(null)}
    >
      <Suspense fallback={null}>
        <SceneThemeProvider theme={theme}>
          <OfficeScene
          people={people}
          {...(meetingTitle ? { meetingTitle } : {})}
          selectedAgent={selectedAgent ?? null}
          {...(onSelectAgent ? { onSelectAgent } : {})}
          />
          <RoomLabelsOverlay rooms={rooms} container={overlay} />
          <PeopleOverlay
            people={people}
            container={overlay}
            selectedId={selectedAgent ?? null}
          />
        </SceneThemeProvider>
      </Suspense>
      <CameraRig view={view} />
    </Canvas>
  );
}

export { cameraViews };
export type { CameraViewId };
