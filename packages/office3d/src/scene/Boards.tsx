"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { CanvasTexture, SRGBColorSpace } from "three";
import type { Simulation } from "../runtime/sim";
import { wx, wz } from "./coords";

/**
 * Tableros vivos: la pared de pantallas del laboratorio y el kanban de
 * gestion de proyectos. Portados del prototipo, dibujados sobre textura de
 * canvas y refrescados en cada cuadro.
 */

function useCanvasTexture(width: number, height: number) {
  const value = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    return { canvas, ctx, texture };
  }, [width, height]);

  useEffect(() => () => value.texture.dispose(), [value]);
  return value;
}

/** Pared de pantallas con barras y una onda, en el laboratorio. */
export function LabScreens({ sim }: { sim: Simulation }) {
  const { canvas, ctx, texture } = useCanvasTexture(1024, 184);

  useFrame(() => {
    if (!ctx) return;
    const t = sim.time;
    ctx.fillStyle = "#0b1a1e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 24; i += 1) {
      const h = 20 + Math.abs(Math.sin(t * 0.9 + i * 0.8)) * 130;
      ctx.fillStyle = i % 6 === 0 ? "#f5a524" : "#3fc1b0";
      ctx.globalAlpha = 0.85;
      ctx.fillRect(24 + i * 41, canvas.height - 12 - h, 26, h);
    }

    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#c39bff";
    ctx.lineWidth = 5;
    ctx.beginPath();
    for (let i = 0; i <= 40; i += 1) {
      const x = 20 + i * 24.5;
      const y = 60 + Math.sin(t * 0.6 + i * 0.4) * 28;
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    }
    ctx.stroke();
    texture.needsUpdate = true;
  });

  return (
    <group>
      <mesh position={[wx(1070), 24, wz(26)]} castShadow>
        <boxGeometry args={[196, 48, 3]} />
        <meshStandardMaterial color="#1e2629" roughness={0.7} />
      </mesh>
      <mesh position={[wx(1070), 12 + 17, wz(28)]}>
        <planeGeometry args={[190, 34]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
}

/** Kanban de gestion de proyectos, alimentado por el estado real. */
export function KanbanBoard({ sim }: { sim: Simulation }) {
  const { canvas, ctx, texture } = useCanvasTexture(1024, 216);

  useFrame(() => {
    if (!ctx) return;
    ctx.fillStyle = "#f4f8f7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const names = ["Por hacer", "En curso", "Tu revisión", "Hecho"];
    const colors = ["#8fb0b2", "#3fc1b0", "#f5a524", "#7fa8ff"];

    const agents = sim.people.filter((p) => p.kind === "agent");
    const counts = [
      agents.filter((a) => sim.workOf(a).queue.some((q) => q.status === "pendiente")).length,
      agents.filter((a) => a.state === "working").length,
      sim.inbox.length,
      Math.min(8, Math.floor(sim.automatedTasks / 40) + 2),
    ];

    ctx.font = '600 30px "Inter", system-ui, sans-serif';
    ctx.textBaseline = "top";

    names.forEach((name, i) => {
      const x0 = i * 256;
      if (i) {
        ctx.fillStyle = "#c5d3d1";
        ctx.fillRect(x0, 10, 3, canvas.height - 20);
      }
      ctx.fillStyle = "#34494d";
      ctx.fillText(name, x0 + 18, 12);
      const n = counts[i] ?? 0;
      for (let k = 0; k < Math.min(n, 8); k += 1) {
        ctx.fillStyle = colors[i] as string;
        ctx.fillRect(x0 + 18 + (k % 4) * 56, 60 + Math.floor(k / 4) * 72, 44, 58);
      }
    });

    texture.needsUpdate = true;
  });

  return (
    <group>
      <mesh position={[wx(1070), 27, wz(346)]} castShadow>
        <boxGeometry args={[196, 54, 3]} />
        <meshStandardMaterial color="#e8e2d6" roughness={0.8} />
      </mesh>
      <mesh position={[wx(1070), 10 + 20, wz(348)]}>
        <planeGeometry args={[190, 40]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
}


/** Los dos tableros vivos de la oficina. */
export function Boards({ sim }: { sim: Simulation }) {
  return (
    <group>
      <LabScreens sim={sim} />
      <KanbanBoard sim={sim} />
    </group>
  );
}
