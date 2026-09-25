import type { ReactNode } from "react";
import { cn } from "../cn";
import { Container } from "./container";

/**
 * Seccion de pagina. `tone` implementa la alternancia oscuro -> claro -> oscuro
 * de docs/WEB.md §2.4. Ninguna pagina pinta fondos de marca a mano.
 */
export function Section({
  children,
  tone = "dark",
  id,
  className,
  bleed = false,
}: {
  children: ReactNode;
  tone?: "dark" | "light" | "gray";
  id?: string;
  className?: string;
  /** Sin Container, para secciones que manejan su propio ancho. */
  bleed?: boolean;
}) {
  const tones = {
    dark: "bg-altec-black text-altec-cream",
    light: "bg-altec-cream text-altec-black",
    gray: "bg-altec-dark-gray text-altec-cream",
  } as const;

  return (
    <section
      id={id}
      className={cn("scroll-mt-20 py-20 md:py-28 lg:py-32", tones[tone], className)}
    >
      {bleed ? children : <Container>{children}</Container>}
    </section>
  );
}
