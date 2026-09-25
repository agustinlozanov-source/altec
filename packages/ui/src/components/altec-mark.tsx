import { cn } from "../cn";

/**
 * Isotipo: las tres diagonales. Se usa como favicon y elemento decorativo
 * (docs/WEB.md §2.3).
 *
 * PROVISIONAL: esta es una reconstruccion geometrica mientras llega el SVG
 * oficial. Cuando llegue, se sustituye el contenido de este archivo por el
 * path real y nada mas del monorepo cambia.
 */
export function AltecMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 46 32"
      aria-hidden="true"
      focusable="false"
      className={cn("text-altec-green", className)}
    >
      <g fill="currentColor">
        <polygon points="8,0 14,0 6,32 0,32" />
        <polygon points="24,0 30,0 22,32 16,32" />
        <polygon points="40,0 46,0 38,32 32,32" />
      </g>
    </svg>
  );
}
