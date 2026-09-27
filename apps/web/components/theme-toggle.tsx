"use client";

import { useSyncExternalStore } from "react";
import { cn } from "@altec/ui";

/**
 * Interruptor de modo, flotante abajo a la derecha.
 *
 * El oscuro es el predeterminado. La elección se guarda en el navegador y la
 * aplica el script del layout antes de pintar, así que no hay parpadeo.
 *
 * El estado no vive en React: vive en el atributo `data-theme` del documento y
 * el componente se suscribe a él.
 */

export const THEME_KEY = "altec-theme";

type Mode = "dark" | "light";

/** Aplica y recuerda el modo. Va fuera del componente: el compilador de React
 *  no permite escribir sobre valores capturados en el render. */
function apply(mode: Mode) {
  document.documentElement.dataset.theme = mode;
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    // Navegación privada: el cambio vale solo para esta sesión.
  }
}

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

const serverMode = (): Mode => "dark";

export function ThemeToggle() {
  const mode = useSyncExternalStore(subscribe, readMode, serverMode);

  const set = (next: Mode) => apply(next);

  return (
    <div
      className={cn(
        "bg-card border-line rounded-pill fixed right-5 bottom-5 z-50 flex items-center",
        "gap-1 border p-1 shadow-[0_5px_50px_0_rgb(0_0_0/0.15)] backdrop-blur",
      )}
    >
      {(
        [
          ["light", "☀", "Modo claro"],
          ["dark", "☾", "Modo oscuro"],
        ] as const
      ).map(([value, glyph, label]) => (
        <button
          key={value}
          type="button"
          onClick={() => set(value)}
          aria-pressed={mode === value}
          aria-label={label}
          title={label}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors",
            mode === value ? "bg-altec-green text-on-accent" : "text-muted hover:text-ink",
          )}
        >
          <span aria-hidden="true">{glyph}</span>
        </button>
      ))}
    </div>
  );
}
