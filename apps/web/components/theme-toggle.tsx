"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@altec/ui";

/**
 * Interruptor de modo claro / oscuro.
 *
 * El oscuro es el predeterminado (CLAUDE.md). La eleccion se guarda en el
 * navegador y la aplica el script de `layout.tsx` antes de pintar, para que no
 * haya parpadeo al cargar.
 *
 * El estado no vive en React: vive en el atributo `data-theme` del documento,
 * y el componente se suscribe a el. Asi no hace falta sincronizar nada al
 * montar, y si hubiera dos interruptores en pantalla coincidirian solos.
 */

export const THEME_KEY = "altec-theme";

type Mode = "dark" | "light";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

const readMode = (): Mode =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";

/** En el servidor siempre es oscuro: es el predeterminado. */
const serverMode = (): Mode => "dark";

export function ThemeToggle({ className }: { className?: string }) {
  const mode = useSyncExternalStore(subscribe, readMode, serverMode);

  const toggle = () => {
    const next: Mode = mode === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Navegacion privada o almacenamiento bloqueado: se queda por sesion.
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mode === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={mode === "dark" ? "Modo claro" : "Modo oscuro"}
      className={cn(
        "border-line hover:border-line-strong text-ink rounded-pill border p-2 transition-colors",
        className,
      )}
    >
      <span aria-hidden="true" className="block text-sm leading-none">
        {mode === "dark" ? "☀" : "☾"}
      </span>
    </button>
  );
}
