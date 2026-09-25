"use client";

import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, type RefObject } from "react";
import { ACESFilmicToneMapping, NoToneMapping, Vector3 } from "three";
import { cameraViews, roomById, rooms, type CameraViewId } from "../layouts/default";
import type { DayScript } from "../runtime/script";
import type { Simulation } from "../runtime/sim";
import { SceneThemeProvider, studioTheme, type SceneTheme } from "../themes";
import { OfficeScene } from "./OfficeScene";
import { MotorCounter, PeopleOverlay, RoomLabelsOverlay } from "./PeopleOverlay";
import { wx, wz } from "./coords";

/** Posicion de camara y objetivo para cada vista del panel (§8.4). */
function viewTarget(view: CameraViewId): { position: Vector3; target: Vector3 } {
  const general = {
    position: new Vector3(-470, 620, 760),
    target: new Vector3(0, 0, 30),
  };
  if (view === "general") return general;

  const room = roomById.get(view);
  if (!room) return general;

  const cx = wx(room.x + room.w / 2);
  const cz = wz(room.y + room.h / 2);
  const span = Math.max(room.w, room.h);
  const dist = Math.max(span * 0.62, 190);

  return {
    position: new Vector3(cx - dist * 0.55, dist * 0.78, cz + dist * 0.95),
    target: new Vector3(cx, 22, cz),
  };
}

type ControlsLike = {
  target: Vector3;
  update: () => void;
  addEventListener: (type: string, fn: () => void) => void;
  removeEventListener: (type: string, fn: () => void) => void;
};

/**
 * Camara: obedece los botones de vista y, si la automatica esta encendida, se
 * acerca sola cuando empieza una junta o llega una decision. Se apaga sola en
 * cuanto el usuario mueve la camara, como en el prototipo.
 */
function CameraRig({
  view,
  sim,
  autoCam,
  onUserMove,
  onAutoView,
}: {
  view: CameraViewId;
  sim: Simulation;
  autoCam: boolean;
  onUserMove: () => void;
  onAutoView: (view: CameraViewId) => void;
}) {
  const controls = useRef<ControlsLike | null>(null);
  const { camera } = useThree();
  const anim = useRef<{ fromP: Vector3; fromT: Vector3; toP: Vector3; toT: Vector3; t: number } | null>(
    null,
  );

  useEffect(() => {
    const node = controls.current;
    if (!node) return;
    const { position, target } = viewTarget(view);
    anim.current = {
      fromP: camera.position.clone(),
      fromT: node.target.clone(),
      toP: position,
      toT: target,
      t: 0,
    };
  }, [view, camera]);

  useEffect(() => {
    const node = controls.current;
    if (!node) return;
    const handler = () => {
      anim.current = null;
      onUserMove();
    };
    node.addEventListener("start", handler);
    return () => node.removeEventListener("start", handler);
  }, [onUserMove]);

  // La simulacion pide foco; solo se obedece si la automatica esta encendida.
  useEffect(() => {
    if (!autoCam || !sim.focusRequest) return;
    const requested = sim.focusRequest as CameraViewId;
    sim.focusRequest = null;
    if (cameraViews.some((v) => v.id === requested)) onAutoView(requested);
  });

  useFrame((_, delta) => {
    const node = controls.current;
    const a = anim.current;
    if (!node || !a) return;

    a.t = Math.min(1, a.t + delta / 1.3);
    const e = 1 - Math.pow(1 - a.t, 3);
    camera.position.lerpVectors(a.fromP, a.toP, e);
    node.target.lerpVectors(a.fromT, a.toT, e);
    node.update();
    if (a.t >= 1) anim.current = null;
  });

  return (
    <OrbitControls
      ref={controls as never}
      makeDefault
      enablePan={false}
      minDistance={110}
      maxDistance={1500}
      maxPolarAngle={Math.PI / 2.35}
      target={[0, 0, 30]}
    />
  );
}

export type OfficeCanvasProps = {
  sim: Simulation;
  script: DayScript;
  view: CameraViewId;
  overlay: RefObject<HTMLDivElement | null>;
  autoCam: boolean;
  onUserMove: () => void;
  onAutoView: (view: CameraViewId) => void;
  /** Apariencia de la oficina. Por defecto, la del prototipo. */
  theme?: SceneTheme;
  selectedAgent?: string | null;
  onSelectAgent?: (key: string | null) => void;
};

export function OfficeCanvas({
  sim,
  script,
  view,
  overlay,
  autoCam,
  onUserMove,
  onAutoView,
  theme = studioTheme,
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
            sim={sim}
            script={script}
            selectedAgent={selectedAgent ?? null}
            {...(onSelectAgent ? { onSelectAgent } : {})}
          />
          <RoomLabelsOverlay rooms={rooms} container={overlay} />
          <MotorCounter value={sim.automatedTasks} container={overlay} />
          <PeopleOverlay
            people={sim.people}
            container={overlay}
            selectedId={selectedAgent ?? null}
          />
        </SceneThemeProvider>
      </Suspense>
      <CameraRig
        view={view}
        sim={sim}
        autoCam={autoCam}
        onUserMove={onUserMove}
        onAutoView={onAutoView}
      />
    </Canvas>
  );
}

export { cameraViews };
export type { CameraViewId };
