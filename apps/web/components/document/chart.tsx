"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartConfiguration,
} from "chart.js";
import { chartSeries } from "@altec/ui";

/**
 * Las graficas del Documento Maestro.
 *
 * Chart.js dibuja en un canvas, y un canvas no hereda tokens: hay que pasarle
 * los colores como datos. Por eso el componente los lee del CSS computado del
 * propio contenedor — asi recoge el contexto de superficie donde esta — y
 * vuelve a construir la grafica cuando cambia el modo claro/oscuro.
 *
 * Tambien espera a que la grafica entre en pantalla antes de dibujarla. Son
 * diez graficas en un documento largo; construirlas todas de golpe al cargar
 * no le sirve a nadie.
 */

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Filler,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
);

export type ChartUnit = "percent" | "mxn" | "usd" | "count";

export type ChartSpec = {
  type: "doughnut" | "bar" | "line";
  labels: string[];
  values: number[];
  /** Barras horizontales en vez de verticales. */
  horizontal?: boolean;
  unit?: ChartUnit;
  /** Indices de la escala de series (0-7). Por defecto, en orden. */
  colors?: number[];
  /** Estos puntos van a plena opacidad y el resto atenuados. */
  highlight?: number[];
  /** Un solo color con la opacidad bajando: sirve para escalas de prioridad. */
  ramp?: boolean;
  /** Linea de meta punteada. */
  goal?: { value: number; label: string };
  /** Rellenar bajo la linea. */
  area?: boolean;
  /** Texto al centro del donut. */
  centerLabel?: string;
};

const SERIES_COUNT = chartSeries.length;

function readVars(element: HTMLElement) {
  const style = getComputedStyle(element);
  const get = (name: string) => style.getPropertyValue(name).trim();
  return {
    // Estas si se leen del CSS: cambian con el modo claro/oscuro y con el
    // contexto de superficie, y al usarlas utilidades de Tailwind siempre
    // acaban en la hoja de estilos.
    ink: get("--color-ink") || "#ffffff",
    muted: get("--color-muted") || "#cccccc",
    line: get("--color-line") || "rgba(255,255,255,0.1)",
    surface: get("--color-surface") || "#0e0f11",
    card: get("--color-card") || "#1e1f22",
    // La escala de series viene de `@altec/ui/tokens`, no del CSS. Tailwind 4
    // descarta de la hoja las variables de `@theme` que ninguna utilidad usa, y
    // ninguna clase pinta con `--color-chart-N`: leerlas devolveria cadena
    // vacia y el canvas dibujaria en negro. Es exactamente el caso para el que
    // existe `tokens.ts` — el mismo color, como dato.
    series: chartSeries,
    // El canvas no entiende `var()`: necesita el nombre de la familia ya
    // resuelto. En una propiedad personalizada, el valor computado ya trae las
    // sustituciones hechas, asi que esto devuelve "Barlow, ui-sans-serif, ...".
    fontSans: get("--font-sans") || "system-ui, sans-serif",
    fontMono: get("--font-mono") || "ui-monospace, monospace",
  };
}

/**
 * Mismo color, con transparencia.
 *
 * No se usa `color-mix()` porque el valor termina en `ctx.fillStyle`, y ahi el
 * soporte depende del navegador. Esto produce un `rgb(... / a)` que entiende
 * cualquiera.
 */
function withAlpha(color: string, alpha: number): string {
  const hex = /^#([0-9a-f]{6})$/i.exec(color.trim());
  if (hex) {
    const value = hex[1]!;
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);
    return `rgb(${r} ${g} ${b} / ${alpha})`;
  }
  const rgb = /rgba?\(([^)]+)\)/i.exec(color);
  if (rgb) {
    const [r, g, b] = rgb[1]!.split(/[\s,/]+/).filter(Boolean);
    return `rgb(${r} ${g} ${b} / ${alpha})`;
  }
  return color;
}

function formatValue(value: number, unit: ChartUnit | undefined): string {
  switch (unit) {
    case "percent":
      return `${value.toLocaleString("es-MX", { maximumFractionDigits: 1 })}%`;
    case "mxn":
      return `$${value.toLocaleString("es-MX")} MXN`;
    case "usd":
      return `$${value.toLocaleString("es-MX")} USD`;
    default:
      return value.toLocaleString("es-MX");
  }
}

/** Abrevia para los ejes, donde no cabe la cifra entera. */
function formatAxis(value: number, unit: ChartUnit | undefined): string {
  const abbreviated =
    Math.abs(value) >= 1_000_000
      ? `${(value / 1_000_000).toLocaleString("es-MX", { maximumFractionDigits: 1 })}M`
      : Math.abs(value) >= 1_000
        ? `${(value / 1_000).toLocaleString("es-MX", { maximumFractionDigits: 0 })}K`
        : value.toLocaleString("es-MX");

  if (unit === "percent") return `${value}%`;
  if (unit === "mxn" || unit === "usd") return `$${abbreviated}`;
  return abbreviated;
}

function buildConfig(spec: ChartSpec, vars: ReturnType<typeof readVars>): ChartConfiguration {
  const palette = (spec.colors ?? spec.labels.map((_, i) => i % SERIES_COUNT)).map(
    (index) => vars.series[index % SERIES_COUNT] ?? vars.series[0] ?? "#c1ff72",
  );

  const colorFor = (index: number): string => {
    if (spec.ramp) {
      const base = vars.series[0] ?? "#c1ff72";
      const steps = Math.max(spec.labels.length - 1, 1);
      return withAlpha(base, 1 - (index / steps) * 0.62);
    }
    const base = palette[index % palette.length] ?? "#c1ff72";
    if (!spec.highlight || spec.highlight.length === 0) return base;
    return spec.highlight.includes(index) ? base : withAlpha(base, 0.38);
  };

  const backgroundColor = spec.labels.map((_, index) => colorFor(index));

  const tooltip = {
    backgroundColor: vars.card,
    titleColor: vars.ink,
    bodyColor: vars.ink,
    borderColor: vars.line,
    borderWidth: 1,
    padding: 12,
    cornerRadius: 8,
    displayColors: false,
    titleFont: { family: vars.fontSans, weight: 600 as const, size: 13 },
    bodyFont: { family: vars.fontMono, size: 13 },
  };

  if (spec.type === "doughnut") {
    const config: ChartConfiguration<"doughnut"> = {
      type: "doughnut",
      data: {
        labels: spec.labels,
        datasets: [
          {
            data: spec.values,
            backgroundColor,
            borderColor: vars.surface,
            borderWidth: 3,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: vars.ink,
              boxWidth: 10,
              boxHeight: 10,
              usePointStyle: true,
              pointStyle: "circle",
              padding: 14,
              font: { family: vars.fontSans, size: 13 },
            },
          },
          tooltip: {
            ...tooltip,
            callbacks: {
              label: (item) => ` ${formatValue(Number(item.parsed), spec.unit)}`,
            },
          },
        },
      },
    };
    return config;
  }

  if (spec.type === "line") {
    const accent = vars.series[0] ?? "#c1ff72";
    return {
      type: "line",
      data: {
        labels: spec.labels,
        datasets: [
          {
            data: spec.values,
            borderColor: accent,
            backgroundColor: withAlpha(accent, 0.22),
            borderWidth: 2.5,
            pointBackgroundColor: accent,
            pointBorderColor: vars.surface,
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.35,
            fill: spec.area ?? false,
          },
          ...(spec.goal
            ? [
                {
                  label: spec.goal.label,
                  data: spec.labels.map(() => spec.goal!.value),
                  borderColor: vars.muted,
                  borderWidth: 1.5,
                  borderDash: [6, 6],
                  pointRadius: 0,
                  fill: false,
                },
              ]
            : []),
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            ...tooltip,
            callbacks: {
              label: (item) => ` ${formatValue(Number(item.parsed.y), spec.unit)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { color: vars.line },
            ticks: { color: vars.muted, font: { family: vars.fontMono, size: 11 } },
          },
          y: {
            beginAtZero: true,
            grid: { color: vars.line },
            border: { display: false },
            ticks: {
              color: vars.muted,
              font: { family: vars.fontMono, size: 11 },
              callback: (value) => formatAxis(Number(value), spec.unit),
            },
          },
        },
      },
    };
  }

  const horizontal = spec.horizontal ?? false;
  const valueAxis = horizontal ? "x" : "y";
  const categoryAxis = horizontal ? "y" : "x";

  return {
    type: "bar",
    data: {
      labels: spec.labels,
      datasets: [{ data: spec.values, backgroundColor, borderRadius: 6, borderSkipped: false }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: horizontal ? "y" : "x",
      plugins: {
        legend: { display: false },
        tooltip: {
          ...tooltip,
          callbacks: {
            label: (item) =>
              ` ${formatValue(Number(horizontal ? item.parsed.x : item.parsed.y), spec.unit)}`,
          },
        },
      },
      scales: {
        [categoryAxis]: {
          grid: { display: false },
          border: { color: vars.line },
          ticks: {
            color: vars.ink,
            font: { family: vars.fontSans, size: 12 },
            autoSkip: false,
          },
        },
        [valueAxis]: {
          beginAtZero: true,
          grid: { color: vars.line },
          border: { display: false },
          ticks: {
            color: vars.muted,
            font: { family: vars.fontMono, size: 11 },
            callback: (value) => formatAxis(Number(value), spec.unit),
          },
        },
      },
    },
  };
}

export function DocChart({
  spec,
  caption,
  height = 320,
}: {
  spec: ChartSpec;
  caption?: string;
  height?: number;
}) {
  const holder = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  // Cambia cuando cambia el modo; es lo que fuerza a reconstruir la grafica.
  const [themeTick, setThemeTick] = useState(0);

  /**
   * Dibuja cuando la grafica se acerca a la pantalla.
   *
   * Esto lo haria IntersectionObserver en una linea, pero si el observador no
   * dispara —pestaña en segundo plano, vista sin pintar, un navegador raro— la
   * grafica no aparece nunca y no hay error que lo delate. Medir la posicion
   * contra el scroll es el mismo efecto sin ese modo de fallo, y ademas mide
   * una vez al montar, asi que lo que ya esta en pantalla se dibuja de entrada.
   *
   * El ResizeObserver cubre el caso que el scroll no ve: que la grafica entre
   * en pantalla porque encogio lo que tenia encima —al cargar las fuentes, al
   * plegarse una seccion— sin que nadie haya hecho scroll.
   */
  useEffect(() => {
    const node = holder.current;
    if (!node) return;

    let frame = 0;
    let done = false;

    const stop = () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resize.disconnect();
    };

    const check = () => {
      frame = 0;
      if (done) return;
      const box = node.getBoundingClientRect();
      if (box.top < window.innerHeight + 200 && box.bottom > -200) {
        done = true;
        setVisible(true);
        stop();
      }
    };

    const schedule = () => {
      if (frame || done) return;
      frame = requestAnimationFrame(check);
    };

    const resize = new ResizeObserver(schedule);
    resize.observe(document.documentElement);

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      stop();
    };
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => setThemeTick((tick) => tick + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const node = canvas.current;
    if (!node) return;

    // Una grafica que falle no puede llevarse por delante el documento entero:
    // son cuarenta paginas de texto y la grafica es el acompañamiento.
    let instance: Chart;
    try {
      instance = new Chart(node, buildConfig(spec, readVars(node)));
    } catch (error) {
      console.error("No se pudo dibujar la gráfica del documento", error);
      return;
    }

    // Vuelve a medir en el siguiente fotograma. Al cambiar de modo se destruye
    // la grafica y se construye otra en el mismo ciclo, y al destruir se
    // devuelve el canvas a su tamaño original: la nueva puede medir ese estado
    // intermedio y dibujarse del tamaño de una astilla. Esto la recoloca ya con
    // el layout asentado, y cuesta un fotograma.
    const settle = requestAnimationFrame(() => instance.resize());

    return () => {
      cancelAnimationFrame(settle);
      instance.destroy();
    };
    // `themeTick` no se usa dentro, pero es justo lo que tiene que reconstruirla.
  }, [visible, spec, themeTick]);

  return (
    <figure ref={holder} className="border-line bg-card/40 my-8 rounded-xl border p-5">
      <div style={{ height }} className="relative">
        <canvas ref={canvas} role="img" aria-label={caption ?? "Gráfica del documento"} />
      </div>
      {caption ? (
        <figcaption className="text-muted border-line mt-4 border-t pt-3 text-center font-mono text-xs tracking-wide">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
