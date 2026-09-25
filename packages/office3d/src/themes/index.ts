export * from "./types";
export { studioTheme } from "./studio";
export { altecTheme } from "./altec";
export { SceneThemeProvider, useSceneTheme } from "./context";

import { studioTheme } from "./studio";
import { altecTheme } from "./altec";

/** Temas disponibles, para elegir desde el dashboard. */
export const sceneThemes = {
  studio: studioTheme,
  altec: altecTheme,
} as const;

export type SceneThemeId = keyof typeof sceneThemes;
