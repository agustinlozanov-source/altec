"use client";

import { useCallback, useEffect, useRef, type ComponentProps } from "react";
import { cn } from "../cn";

/**
 * Campo de puntos que responde con ondas expansivas.
 *
 * Dibuja sobre canvas y toma su color del `color` calculado del elemento, asi
 * que sigue a los tokens de marca. Se queda quieto cuando no hay ninguna onda
 * viva, se pausa fuera de pantalla y en pestanas ocultas, y con
 * prefers-reduced-motion se queda como una retícula fija.
 *
 * Adaptado de un componente de terceros: se cambio `@/lib/utils` por nuestro
 * `cn` y `text-primary` por el acento de marca.
 */

export interface SonarGridProps extends ComponentProps<"div"> {
  /** Separación entre puntos, en píxeles CSS. */
  spacing?: number;
  /** Radio del punto en reposo. */
  dotRadius?: number;
  /** Opacidad en reposo (0–1). Los puntos de la onda llegan a 1. */
  baseOpacity?: number;
  /** Cualquier color CSS. Por defecto, el acento de marca. */
  color?: string;
  /** Segundos entre ondas automáticas. 0 las desactiva. */
  pingEvery?: number;
  /** Velocidad del frente de onda, en píxeles por segundo. */
  speed?: number;
  /** Grosor del frente de onda. */
  ringWidth?: number;
  /** Cuánto crece un punto en la cresta (0 = no crece, 2 = triplica). */
  amplitude?: number;
  /** Emitir una onda donde el visitante toca o hace clic. */
  interactive?: boolean;
  /** Máximo de ondas simultáneas. Se descartan las más viejas. */
  maxRings?: number;
  /** Arrancar con una onda a medio expandir, para que el primer cuadro ya cuente la idea. */
  seedPing?: boolean;
  /** Zona donde pueden nacer las ondas, en fracciones del alto y ancho. */
  pingArea?: [number, number, number, number];
  /** Etiqueta a renderizar. `section` cuando el campo ES una sección de la página. */
  as?: "div" | "section";
}

interface Ring {
  x: number;
  y: number;
  born: number;
}

const MAX_DPR = 2;
const TAU = Math.PI * 2;

export function SonarGrid({
  spacing = 26,
  dotRadius = 1.4,
  baseOpacity = 0.28,
  color,
  pingEvery = 2.4,
  speed = 260,
  ringWidth = 90,
  amplitude = 2.2,
  interactive = true,
  maxRings = 6,
  seedPing = true,
  pingArea = [0.15, 0.2, 0.85, 0.8],
  as: Tag = "div",
  className,
  children,
  ref,
  ...rest
}: SonarGridProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringsRef = useRef<Ring[]>([]);
  const refreshRef = useRef<() => void>(() => {});

  // El bucle lee las props por esta referencia, para que cambiarlas no lo
  // obligue a reiniciarse.
  const opts = useRef({
    spacing,
    dotRadius,
    baseOpacity,
    pingEvery,
    speed,
    ringWidth,
    amplitude,
    interactive,
    maxRings,
    seedPing,
    pingArea,
  });
  opts.current = {
    spacing,
    dotRadius,
    baseOpacity,
    pingEvery,
    speed,
    ringWidth,
    amplitude,
    interactive,
    maxRings,
    seedPing,
    pingArea,
  };

  const setHost = useCallback(
    (node: HTMLDivElement | null) => {
      hostRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let raf = 0;
    let timer = 0;
    let visible = true;
    let seeded = false;
    let stroke = "";
    let nextPing = performance.now() + opts.current.pingEvery * 1000;

    const readColor = () => {
      stroke = getComputedStyle(canvas).color;
    };

    const addRing = (x: number, y: number, born: number) => {
      readColor();
      const rings = ringsRef.current;
      rings.push({ x, y, born });
      while (rings.length > opts.current.maxRings) rings.shift();
    };

    const draw = (now: number) => {
      const o = opts.current;
      // Segundos hasta que la onda sale del lienzo.
      const lifetime = (Math.hypot(width, height) + o.ringWidth) / o.speed;
      ringsRef.current = ringsRef.current.filter((r) => (now - r.born) / 1000 < lifetime);
      const live = ringsRef.current.map((r) => {
        const age = (now - r.born) / 1000;
        const radius = age * o.speed;
        return { x: r.x, y: r.y, radius, reach: radius + o.ringWidth, fade: 1 - age / lifetime };
      });

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = stroke;

      const cols = Math.ceil(width / o.spacing) + 1;
      const rows = Math.ceil(height / o.spacing) + 1;
      const offsetX = (width - (cols - 1) * o.spacing) / 2;
      const offsetY = (height - (rows - 1) * o.spacing) / 2;

      // Primera pasada: todos los puntos en reposo, en un solo trazo.
      const hot: number[] = [];
      ctx.globalAlpha = o.baseOpacity;
      ctx.beginPath();
      for (let i = 0; i < cols; i++) {
        const cx = offsetX + i * o.spacing;
        for (let j = 0; j < rows; j++) {
          const cy = offsetY + j * o.spacing;
          let energy = 0;
          for (const r of live) {
            if (Math.abs(cx - r.x) > r.reach || Math.abs(cy - r.y) > r.reach) continue;
            const dist = Math.abs(Math.hypot(cx - r.x, cy - r.y) - r.radius);
            if (dist >= o.ringWidth) continue;
            const t = 1 - dist / o.ringWidth;
            const k = t * t * (3 - 2 * t) * r.fade;
            if (k > energy) energy = k;
          }
          if (energy < 0.01) {
            ctx.moveTo(cx + o.dotRadius, cy);
            ctx.arc(cx, cy, o.dotRadius, 0, TAU);
          } else {
            hot.push(cx, cy, energy);
          }
        }
      }
      ctx.fill();

      // Segunda pasada: solo los puntos sobre un frente de onda.
      for (let k = 0; k < hot.length; k += 3) {
        const energy = hot[k + 2] ?? 0;
        ctx.globalAlpha = o.baseOpacity + (1 - o.baseOpacity) * energy;
        ctx.beginPath();
        ctx.arc(hot[k] ?? 0, hot[k + 1] ?? 0, o.dotRadius * (1 + o.amplitude * energy), 0, TAU);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!seeded) {
        seeded = true;
        const [x0, y0, x1, y1] = opts.current.pingArea;
        if (opts.current.seedPing && !reduceMotion.matches) {
          addRing(
            width * (x0 + (x1 - x0) * 0.68),
            height * (y0 + (y1 - y0) * 0.34),
            performance.now() - 500,
          );
        }
      }
      draw(performance.now());
    };

    const scheduleIdle = (delay: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => tick(performance.now()), Math.max(16, delay));
    };

    const tick = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      if (reduceMotion.matches) {
        ringsRef.current = [];
        draw(now);
        return;
      }
      const o = opts.current;
      if (o.pingEvery > 0 && now >= nextPing) {
        const [x0, y0, x1, y1] = o.pingArea;
        addRing(
          width * (x0 + Math.random() * (x1 - x0)),
          height * (y0 + Math.random() * (y1 - y0)),
          now,
        );
        nextPing = now + o.pingEvery * 1000;
      }
      draw(now);
      if (ringsRef.current.length > 0) raf = requestAnimationFrame(tick);
      else if (o.pingEvery > 0) scheduleIdle(nextPing - now);
    };

    const wake = () => {
      if (!raf) {
        window.clearTimeout(timer);
        raf = requestAnimationFrame(tick);
      }
    };

    refreshRef.current = () => {
      readColor();
      nextPing = Math.min(nextPing, performance.now() + opts.current.pingEvery * 1000);
      wake();
    };

    const onDown = (e: PointerEvent) => {
      if (!opts.current.interactive || reduceMotion.matches) return;
      const rect = host.getBoundingClientRect();
      addRing(e.clientX - rect.left, e.clientY - rect.top, performance.now());
      wake();
    };
    const onVisibility = () => {
      if (!document.hidden) wake();
    };

    const ro = new ResizeObserver(resize);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? true;
        if (visible) wake();
      },
      { threshold: 0 },
    );

    // Si cambia el tema, el color del canvas cambia: hay que releerlo.
    const mo = new MutationObserver(() => refreshRef.current());
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });

    readColor();
    resize();
    ro.observe(host);
    io.observe(host);
    host.addEventListener("pointerdown", onDown);
    document.addEventListener("visibilitychange", onVisibility);
    reduceMotion.addEventListener("change", wake);
    wake();

    return () => {
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      host.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVisibility);
      reduceMotion.removeEventListener("change", wake);
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      refreshRef.current = () => {};
    };
  }, []);

  // Cambiar una prop mientras el bucle duerme repinta igual.
  useEffect(() => {
    refreshRef.current();
  }, [
    spacing,
    dotRadius,
    baseOpacity,
    color,
    pingEvery,
    speed,
    ringWidth,
    amplitude,
    interactive,
    maxRings,
    pingArea,
  ]);

  return (
    <Tag
      ref={setHost}
      data-slot="sonar-grid"
      className={cn("relative isolate overflow-hidden", className)}
      {...rest}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="text-accent-ink pointer-events-none absolute inset-0 -z-10 size-full"
        style={color ? { color } : undefined}
      />
      {children}
    </Tag>
  );
}
