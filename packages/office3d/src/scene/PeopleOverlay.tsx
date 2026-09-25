"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import { Vector3 } from "three";
import { useSceneTheme } from "../themes";
import { isSitting, type Person } from "../runtime/people";
import { wx, wz } from "./coords";

/**
 * Nombres, globos de dialogo y el signo de espera, proyectados del mundo a la
 * pantalla, como en el prototipo.
 *
 * Los nodos se crean y se mueven a mano, fuera de React: son tres por persona
 * y se actualizan en cada cuadro. Hacerlo con `<Html>` de drei significaria una
 * raiz de React por etiqueta, que ademas ensucia la consola en desarrollo.
 */

type Nodes = { tag: HTMLDivElement; bubble: HTMLDivElement; excl: HTMLDivElement };

export function PeopleOverlay({
  people,
  container,
  selectedId,
}: {
  people: Person[];
  container: RefObject<HTMLDivElement | null>;
  selectedId?: string | null;
}) {
  const theme = useSceneTheme();
  const { camera, size } = useThree();
  const nodes = useRef(new Map<string, Nodes>());
  const vec = useRef(new Vector3());

  useEffect(() => {
    const host = container.current;
    if (!host) return;
    const map = nodes.current;

    for (const person of people) {
      if (map.has(person.id)) continue;

      const tag = document.createElement("div");
      tag.className =
        "absolute left-0 top-0 flex items-center gap-1.5 whitespace-nowrap text-[11px] " +
        "-translate-x-1/2 rounded-full bg-black/55 px-2 py-0.5 text-white/85 backdrop-blur-sm";

      const dot = document.createElement("i");
      dot.className = "inline-block h-1.5 w-1.5 rounded-full";
      if (person.kind === "agent") tag.appendChild(dot);
      tag.appendChild(document.createTextNode(person.label));

      const bubble = document.createElement("div");
      bubble.className =
        "absolute left-0 top-0 max-w-[200px] -translate-x-1/2 -translate-y-full rounded-lg " +
        "bg-white px-2.5 py-1.5 text-[11px] leading-snug text-black shadow-lg";
      bubble.hidden = true;

      const excl = document.createElement("div");
      excl.className =
        "absolute left-0 top-0 -translate-x-1/2 -translate-y-full text-base font-bold";
      excl.textContent = "!";
      excl.style.color = theme.state.awaiting;
      excl.hidden = true;

      host.append(tag, bubble, excl);
      map.set(person.id, { tag, bubble, excl });
    }

    return () => {
      for (const [, n] of map) {
        n.tag.remove();
        n.bubble.remove();
        n.excl.remove();
      }
      map.clear();
    };
  }, [people, container, theme.state.awaiting]);

  useFrame(() => {
    const map = nodes.current;
    const v = vec.current;

    const project = (x: number, y: number, z: number) => {
      v.set(x, y, z).project(camera);
      return {
        x: ((v.x + 1) / 2) * size.width,
        y: ((1 - v.y) / 2) * size.height,
        ok: v.z < 1 && v.z > -1,
      };
    };

    for (const person of people) {
      const n = map.get(person.id);
      if (!n) continue;

      const sitting = isSitting(person);
      const base = project(wx(person.x), 0, wz(person.y));
      const top = project(wx(person.x), sitting ? 52 : 56, wz(person.y));

      n.tag.hidden = !base.ok;
      if (base.ok) n.tag.style.transform = `translate(${base.x.toFixed(1)}px,${(base.y + 6).toFixed(1)}px)`;

      const dot = n.tag.firstElementChild as HTMLElement | null;
      if (dot && dot.tagName === "I") {
        dot.style.background =
          person.moving && person.state !== "awaiting" ? "#8aa9ab" : theme.state[person.state];
      }
      n.tag.style.outline = person.id === selectedId ? `1px solid ${theme.state.working}` : "";

      if (person.bubble && top.ok) {
        n.bubble.hidden = false;
        if (n.bubble.textContent !== person.bubble.text) n.bubble.textContent = person.bubble.text;
        n.bubble.style.transform = `translate(${top.x.toFixed(1)}px,${(top.y - 8).toFixed(1)}px)`;
      } else {
        n.bubble.hidden = true;
      }

      const showExcl = person.state === "awaiting" && !person.bubble && top.ok;
      n.excl.hidden = !showExcl;
      if (showExcl) {
        n.excl.style.transform = `translate(${top.x.toFixed(1)}px,${(top.y - 6).toFixed(1)}px)`;
      }
    }
  });

  return null;
}

/** Nombres de sala, proyectados igual que las etiquetas de las personas. */
export function RoomLabelsOverlay({
  rooms,
  container,
}: {
  rooms: readonly { id: string; name: string; x: number; y: number; human?: boolean }[];
  container: RefObject<HTMLDivElement | null>;
}) {
  const { camera, size } = useThree();
  const nodes = useRef(new Map<string, HTMLDivElement>());
  const vec = useRef(new Vector3());

  useEffect(() => {
    const host = container.current;
    if (!host) return;
    const map = nodes.current;

    for (const room of rooms) {
      if (map.has(room.id)) continue;
      const el = document.createElement("div");
      el.className =
        "absolute left-0 top-0 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.18em] " +
        (room.human ? "text-amber-300/70" : "text-white/35");
      el.textContent = room.name;
      host.appendChild(el);
      map.set(room.id, el);
    }

    return () => {
      for (const [, el] of map) el.remove();
      map.clear();
    };
  }, [rooms, container]);

  useFrame(() => {
    const v = vec.current;
    for (const room of rooms) {
      const el = nodes.current.get(room.id);
      if (!el) continue;
      v.set(wx(room.x + 8), 24, wz(room.y + 14)).project(camera);
      const ok = v.z < 1 && v.z > -1;
      el.hidden = !ok;
      if (!ok) continue;
      const x = ((v.x + 1) / 2) * size.width;
      const y = ((1 - v.y) / 2) * size.height;
      el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`;
    }
  });

  return null;
}
