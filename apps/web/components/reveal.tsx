"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@altec/ui";

/**
 * Aparicion al entrar en viewport.
 *
 * El contenido se renderiza siempre: la animacion solo le quita y le devuelve
 * opacidad. Si el JavaScript no corre, o si el visitante pidio menos
 * movimiento, la pagina se ve completa igual. Nada del contenido depende de
 * que esto funcione.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  /** Retraso en milisegundos, para escalonar una rejilla. */
  delay?: number;
  as?: "div" | "section" | "article" | "li";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    node.dataset.reveal = "hidden";

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        node.dataset.reveal = "shown";
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        "transition-[opacity,transform] duration-500 ease-out",
        "data-[reveal=hidden]:translate-y-6 data-[reveal=hidden]:opacity-0",
        "data-[reveal=shown]:translate-y-0 data-[reveal=shown]:opacity-100",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
