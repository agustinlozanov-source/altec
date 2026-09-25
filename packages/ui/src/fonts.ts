import { JetBrains_Mono, Open_Sans } from "next/font/google";

/**
 * Tipografia del grupo, declarada en un solo lugar (docs/WEB.md §2.2).
 * Open Sans es la fuente del logo: titulos en Extrabold italico, texto en regular.
 * JetBrains Mono queda reservada para datos y cifras.
 *
 * Ambas son variables, por eso no se declara `weight`: el rango completo
 * viaja en un solo archivo.
 */

export const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  style: ["normal", "italic"],
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

/** Clases de las variables de fuente, para poner en el <html> de cada app. */
export const fontVariables = [openSans.variable, jetbrainsMono.variable].join(" ");
