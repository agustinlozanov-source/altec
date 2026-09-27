"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cifra del grupo (docs/WEB.md §4.1).
 *
 * El valor final se pinta desde el servidor y la animacion es un anadido que
 * solo ocurre despues de montar. Antes arrancaba en cero, asi que cualquiera
 * que llegara a la seccion —o le tomara una captura— podia ver "0 empresas
 * integradas" o "+3 sistemas entregados". Una cifra a medio contar no es un
 * efecto: es un dato equivocado.
 *
 * Respeta prefers-reduced-motion: en ese caso nunca anima.
 */
export function StatCounter({
  value,
  prefix = "",
  suffix = "",
  label,
  durationMs = 1100,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  durationMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let done = false;

    const run = () => {
      const startedAt = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setShown(Math.round(value * eased));
        if (progress < 1) frameRef.current = requestAnimationFrame(tick);
        else done = true;
      };
      frameRef.current = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting) || done) return;
        observer.disconnect();
        setShown(0);
        run();
      },
      { threshold: 0.5 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [value, durationMs]);

  return (
    <div ref={ref} className="flex flex-col gap-1">
      <span className="font-display text-accent-ink text-4xl leading-none font-extrabold tabular-nums md:text-5xl wide:text-6xl">
        {prefix}
        {shown.toLocaleString("es-MX")}
        {suffix}
      </span>
      <span className="text-muted text-sm">{label}</span>
    </div>
  );
}
