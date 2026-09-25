"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Contador animado al entrar en viewport (docs/WEB.md §4.1).
 * Respeta prefers-reduced-motion: si esta activo, muestra el valor final
 * sin animar (CLAUDE.md, accesibilidad).
 *
 * El progreso vive en refs y no en estado: React monta y desmonta los efectos
 * dos veces en desarrollo (StrictMode), y con estado la animacion se cancelaba
 * a medio camino sin poder reiniciarse, dejando el contador en cero.
 */
export function StatCounter({
  value,
  prefix = "",
  suffix = "",
  label,
  durationMs = 1400,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
  durationMs?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const finishedRef = useRef(false);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const run = () => {
      // Ya termino antes (o el usuario pidio menos movimiento): al valor final.
      if (finishedRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finishedRef.current = true;
        setShown(value);
        return;
      }

      const startedAt = performance.now();

      const tick = (now: number) => {
        const progress = Math.min((now - startedAt) / durationMs, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        setShown(Math.round(value * eased));

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(tick);
        } else {
          finishedRef.current = true;
          frameRef.current = null;
        }
      };

      frameRef.current = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        run();
      },
      { threshold: 0.4 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [value, durationMs]);

  return (
    <div ref={ref} className="flex flex-col gap-1">
      <span className="font-display text-altec-black text-4xl leading-none font-extrabold italic md:text-5xl">
        {prefix}
        {shown.toLocaleString("es-MX")}
        {suffix}
      </span>
      <span className="text-altec-black/60 text-sm">{label}</span>
    </div>
  );
}
