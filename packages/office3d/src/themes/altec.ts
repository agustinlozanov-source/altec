import { altec, voState } from "@altec/ui/tokens";
import { mix, type SceneTheme } from "./types";
import { studioTheme } from "./studio";

/**
 * Tema "altec": la oficina vestida con la identidad del grupo.
 *
 * NO es el tema por defecto. Existe para demostrar que la apariencia es
 * intercambiable y para cuando se quiera una oficina en la linea de la marca.
 * Todo se deriva de los tokens de packages/ui: neutros calidos, negro en el
 * mobiliario tecnico y el verde como unica luz de acento.
 */

const warm = (t: number) => mix(altec.cream, altec.black, t);

export const altecTheme: SceneTheme = {
  ...studioTheme,
  name: "altec",

  rooms: {
    floors: {
      dir: warm(0.42),
      sp: warm(0.42),
      lounge: warm(0.5),
      junta: warm(0.58),
      socio: warm(0.3),
      lab: warm(0.52),
      pm: warm(0.52),
      bull: warm(0.52),
      lobby: warm(0.36),
      motor: altec.darkGray,
    },
    floorFallback: warm(0.52),
  },

  walls: {
    ...studioTheme.walls,
    solid: warm(0.12),
    human: warm(0.06),
    glass: altec.cream,
    glassOpacity: 0.16,
    trim: warm(0.3),
    trimHuman: voState.awaiting,
    trimMotor: altec.green,
    glassTrim: warm(0.2),
  },

  furniture: {
    ...studioTheme.furniture,
    deskTop: warm(0.28),
    deskLeg: warm(0.64),
    keyboard: warm(0.7),
    monitorStand: warm(0.82),
    monitorBody: altec.darkGray,
    screenOff: warm(0.78),
    screenOn: altec.green,
    chair: warm(0.68),
    chairExec: warm(0.8),
    chairVisitor: warm(0.56),
    chairBase: warm(0.74),
    chairPost: warm(0.7),
    execDesk: mix(altec.cream, "#5a4028", 0.72),
    execDeskLeg: warm(0.78),
    shelf: mix(altec.cream, "#5a4028", 0.6),
    books: [warm(0.35), warm(0.5), altec.green, warm(0.62), warm(0.44), warm(0.7)],
    sofa: warm(0.6),
    loungeTable: warm(0.3),
    coffeeMachine: altec.darkGray,
    coffeeLight: voState.awaiting,
    meetingTable: mix(altec.cream, "#5a4028", 0.68),
    meetingBase: warm(0.78),
    meetingCarpet: warm(0.64),
    plantPot: warm(0.55),
    leafDark: "#4a6b4f",
    leafLight: "#5f8360",
    vacant: warm(0.4),
  },

  board: {
    idleBackground: warm(0.72),
    activeBackground: altec.cream,
    idleText: warm(0.35),
    activeText: altec.black,
    accent: altec.green,
  },

  lighting: {
    ...studioTheme.lighting,
    background: warm(0.94),
    ground: warm(0.9),
    slab: warm(0.86),
    hemiSky: altec.cream,
    hemiGround: warm(0.82),
    hemiIntensity: 1.15,
    ambientIntensity: 0.55,
    sun: altec.white,
    sunIntensity: 2.1,
    human: mix(altec.cream, "#ffb547", 0.45),
    accent: altec.green,
    toneMapping: "none",
  },

  state: voState,
};
