import type { ReactNode } from "react";
import { cn } from "../cn";
import { Container } from "./container";

/**
 * Sección de página.
 *
 * `tone` elige cuál de las dos superficies usa. Alternan dos oscuros muy
 * cercanos, lo bastante distintos para separar secciones sin líneas.
 *
 * El aire vertical es parte del look: 80px en móvil, 120 en escritorio.
 */
export function Section({
  children,
  tone = "base",
  id,
  className,
  bleed = false,
}: {
  children: ReactNode;
  tone?: "base" | "alt";
  id?: string;
  className?: string;
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "bg-surface text-ink scroll-mt-24 py-20 md:py-section",
        tone === "alt" ? "surface-alt" : "surface-base",
        className,
      )}
    >
      {bleed ? children : <Container>{children}</Container>}
    </section>
  );
}
