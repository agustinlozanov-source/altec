"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BufferGeometry, Line, LineDashedMaterial, Vector3 } from "three";
import type { Person } from "../runtime/people";
import { wx, wz } from "./coords";

/**
 * Linea punteada con el recorrido del agente seleccionado, como en el
 * prototipo. Ayuda a entender que los agentes van a algun lado y por que.
 */
export function SelectedPath({
  people,
  selectedId,
}: {
  people: Person[];
  selectedId: string | null;
}) {
  const line = useRef<Line>(null);
  const geometry = useMemo(() => new BufferGeometry(), []);
  const material = useMemo(
    () => new LineDashedMaterial({ color: "#ffffff", dashSize: 6, gapSize: 5 }),
    [],
  );

  useFrame(() => {
    const node = line.current;
    if (!node) return;

    const person = selectedId ? people.find((p) => p.id === selectedId) : null;
    if (!person || person.path.length === 0) {
      node.visible = false;
      return;
    }

    node.visible = true;
    material.color.set(person.look.wear);
    const points = [[person.x, person.y] as const, ...person.path].map(
      (q) => new Vector3(wx(q[0]), 2.5, wz(q[1])),
    );
    geometry.setFromPoints(points);
    node.computeLineDistances();
  });

  return <primitive ref={line} object={new Line(geometry, material)} visible={false} />;
}
