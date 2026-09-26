import type { ReactNode } from "react";
import { cn } from "../cn";
import { Container } from "./container";

/**
 * Seccion de pagina.
 *
 * `tone` NO elige un color: elige cual de las dos superficies del sistema usa
 * la seccion. En modo oscuro alternan negro y cream; en claro, cream y blanco
 * (docs/WEB.md §2.4). Lo que va dentro se escribe con `text-ink`, `text-muted`
 * y `border-line`, y se adapta solo.
 */
export function Section({
  children,
  tone = "base",
  id,
  className,
  bleed = false,
}: {
  children: ReactNode;
  /** `base` es la superficie principal; `alt` la que alterna con ella. */
  tone?: "base" | "alt";
  id?: string;
  className?: string;
  /** Sin Container, para secciones que manejan su propio ancho. */
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "bg-surface text-ink scroll-mt-20 py-20 md:py-28 lg:py-32",
        tone === "alt" ? "surface-alt" : "surface-base",
        className,
      )}
    >
      {bleed ? children : <Container>{children}</Container>}
    </section>
  );
}
