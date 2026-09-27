import type { ReactNode } from "react";
import { cn } from "../cn";

/**
 * Titular grande con degradado de blanco a acento.
 *
 * El degradado va sobre el texto recortado, así que el color sale del token:
 * si cambia el acento, cambia el titular.
 */
export function GradientHeading({
  children,
  className,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "p";
}) {
  return (
    <Tag
      className={cn(
        "font-display bg-clip-text font-bold text-transparent uppercase",
        "bg-[linear-gradient(90deg,var(--color-ink)_0%,var(--color-accent-ink)_100%)]",
        "text-[clamp(2.75rem,7vw,5.625rem)] leading-[1.02] tracking-[0.01em]",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
