"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { setThemeMode, subscribeToTheme, readThemeMode, serverThemeMode } from "../theme-toggle";

/**
 * El interruptor de modo de la cabecera del documento.
 *
 * Es el mismo estado que el del resto del sitio —vive en `data-theme` y se
 * guarda igual—, solo que aqui va en la barra y no flotando en una esquina.
 */
export function DocThemeToggle() {
  const mode = useSyncExternalStore(subscribeToTheme, readThemeMode, serverThemeMode);
  const next = mode === "light" ? "dark" : "light";

  return (
    <button
      type="button"
      onClick={() => setThemeMode(next)}
      className="text-muted hover:text-ink shrink-0 p-2"
      aria-label={next === "light" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={next === "light" ? "Modo claro" : "Modo oscuro"}
    >
      {mode === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
