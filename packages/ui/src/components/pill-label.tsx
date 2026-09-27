import type { ReactNode } from "react";
import { cn } from "../cn";

/**
 * Etiqueta píldora que encabeza cada sección.
 *
 * Es el recurso que da ritmo al referente: antes de cada título, una píldora
 * de borde fino en mayúsculas. Cuesta poco y ordena la lectura.
 */
export function PillLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "border-line-strong text-muted rounded-pill inline-block border px-6 py-2",
        "text-sm font-semibold tracking-[0.08em] uppercase md:text-base",
        className,
      )}
    >
      {children}
    </span>
  );
}
