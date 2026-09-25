"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SceneTheme } from "./types";
import { studioTheme } from "./studio";

/**
 * El tema viaja por contexto para que ningun componente de la escena tenga
 * que recibirlo por props. Sin proveedor, se usa el tema del prototipo.
 */
const SceneThemeContext = createContext<SceneTheme>(studioTheme);

export function SceneThemeProvider({
  theme = studioTheme,
  children,
}: {
  theme?: SceneTheme;
  children: ReactNode;
}) {
  return <SceneThemeContext.Provider value={theme}>{children}</SceneThemeContext.Provider>;
}

export function useSceneTheme(): SceneTheme {
  return useContext(SceneThemeContext);
}
