import { Instrument_Serif, JetBrains_Mono, Open_Sans } from "next/font/google";

/**
 * Tipografia del grupo, declarada en un solo lugar (docs/WEB.md §2.2).
 *
 * Open Sans es la fuente del LOGOTIPO y sostiene toda la interfaz: titulos de
 * seccion, texto y navegacion.
 *
 * Instrument Serif se suma solo para los enunciados de portada. Es el recurso
 * editorial que usan las firmas de consultoria: una serif grande dice
 * "publicamos", una sans dice "vendemos". Se usa con cuentagotas: hero y
 * declaraciones de vision, nunca en texto corrido.
 *
 * JetBrains Mono queda para datos, etiquetas y cifras.
 */

export const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  style: ["normal", "italic"],
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
  openSans.variable,
  instrumentSerif.variable,
  jetbrainsMono.variable,
].join(" ");
