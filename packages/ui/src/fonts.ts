import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";

/**
 * Tipografia del grupo, declarada en un solo lugar (docs/WEB.md §2.2).
 *
 * Inter sostiene la interfaz: titulos, texto y navegacion. Es geometrica y
 * neutra, y aguanta bien los pesos altos que piden los titulares.
 *
 * Instrument Serif se reserva para los enunciados de portada y vision. Una
 * serif grande dice "publicamos"; una sans dice "vendemos".
 *
 * JetBrains Mono queda para datos, etiquetas y cifras.
 *
 * Open Sans, que es la fuente del LOGOTIPO, ya no se usa en la web: el
 * logotipo viaja como imagen y la interfaz no tiene por que heredar su tipo
 * (decision de sep 2026).
 */

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

/** Clases de las variables de fuente, para poner en el <html> de cada app. */
export const fontVariables = [
  inter.variable,
  instrumentSerif.variable,
  jetbrainsMono.variable,
].join(" ");
