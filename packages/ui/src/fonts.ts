import { Barlow, JetBrains_Mono } from "next/font/google";

/**
 * Tipografia del sitio (docs/WEB.md §2.2).
 *
 * Barlow sostiene todo: titulares enormes en mayusculas, interfaz y texto. Es
 * una grotesca de formas bajas y anchas, que es lo que permite subir un titular
 * a 150px sin que se deshaga.
 *
 * JetBrains Mono queda para datos, cifras y etiquetas.
 */

export const barlow = Barlow({
  subsets: ["latin"],
  variable: "--font-barlow",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

/** Clases de las variables de fuente, para poner en el <html> de cada app. */
export const fontVariables = [barlow.variable, jetbrainsMono.variable].join(" ");
