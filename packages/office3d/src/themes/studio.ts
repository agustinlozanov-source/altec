import type { SceneTheme } from "./types";

/**
 * Tema "studio": los colores y medidas del prototipo original
 * (docs/referencias/oficina-3d.html), tal cual.
 *
 * Es el tema POR DEFECTO de la oficina. La identidad de ALTEC manda en el
 * dashboard, no dentro de la escena; aqui se conserva el look que ya estaba
 * aprobado. Quien quiera otra apariencia escribe otro tema.
 */
export const studioTheme: SceneTheme = {
  name: "studio",

  rooms: {
    floors: {
      dir: "#b89b78",
      sp: "#b89b78",
      lounge: "#7e9c88",
      junta: "#44707a",
      socio: "#8e6e4c",
      lab: "#cbd3d3",
      pm: "#cbd3d3",
      bull: "#c3cac6",
      lobby: "#dcd6ca",
      motor: "#1b2c30",
    },
    floorFallback: "#c3cac6",
  },

  walls: {
    solid: "#eef2f1",
    human: "#f3ede3",
    glass: "#9fd4d6",
    glassOpacity: 0.22,
    trim: "#c9d2d1",
    trimHuman: "#f5a524",
    trimMotor: "#3fc1b0",
    glassTrim: "#ddebea",
    height: 22,
    glassHeight: 34,
    thickness: 4,
    doorWidth: 40,
  },

  furniture: {
    deskTop: "#e8e2d6",
    deskLeg: "#56615f",
    keyboard: "#3a4448",
    monitorStand: "#2a3236",
    monitorBody: "#1e2629",
    screenOff: "#1f3439",
    screenOn: "#3fc1b0",
    chair: "#2f3a3e",
    chairExec: "#1f2a2d",
    chairVisitor: "#6e5a48",
    chairBase: "#3a4447",
    chairPost: "#50595c",
    execDesk: "#6b4f36",
    execDeskLeg: "#4a3828",
    shelf: "#8a6a48",
    books: ["#c24f4f", "#2f6f8f", "#e0b48f", "#3f8a63", "#a8893a", "#56606e"],
    sofa: "#2e5a58",
    loungeTable: "#e8e2d6",
    coffeeMachine: "#3a3f44",
    coffeeLight: "#f5a524",
    meetingTable: "#6b4f36",
    meetingBase: "#3e3a36",
    meetingCarpet: "#3a646e",
    plantPot: "#c9b79c",
    leafDark: "#3f8a63",
    leafLight: "#57a578",
    vacant: "#e8e2d6",
    vacantOpacity: 0.26,
  },

  board: {
    idleBackground: "#d5dedd",
    activeBackground: "#f4f8f7",
    idleText: "#6d8487",
    activeText: "#0a1c21",
    accent: "#3fc1b0",
  },

  lighting: {
    background: "#0b1d22",
    ground: "#0e2226",
    slab: "#2b3e43",
    hemiSky: "#e8f3ff",
    hemiGround: "#2a3a3e",
    hemiIntensity: 0.72,
    ambientIntensity: 0.18,
    sun: "#ffffff",
    sunIntensity: 1.35,
    sunPosition: [-260, 420, -180],
    human: "#ffb547",
    humanIntensity: 1.9,
    accent: "#3fc1b0",
    accentIntensity: 1.2,
    toneMapping: "aces",
  },

  state: {
    working: "#3fc1b0",
    meeting: "#7fa8ff",
    collab: "#c39bff",
    awaiting: "#f5a524",
    idle: "#6b6b6b",
  },

  motion: {
    walkSpeed: 62,
    bobRate: 3.4,
    bobHeight: 1.1,
    cameraEase: 0.9,
    awaitingPulseRate: 1.6,
    idleBreathRate: 0.5,
  },

  character: {
    height: 44,
    ringInner: 9,
    ringOuter: 11.5,
    style: "geometry",
  },
};
