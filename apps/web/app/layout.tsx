import { headers } from "next/headers";
import type { Metadata } from "next";
import { fontVariables } from "@altec/ui/fonts";
import { defaultLocale, isLocale, localeHtmlLang } from "@/lib/i18n/config";
import { siteUrl } from "@/lib/site";
import "./globals.css";

/**
 * Layout raíz. El idioma llega por cabecera desde el middleware: es la forma
 * de poner el `lang` correcto en el documento sin tener dos layouts raíz.
 */

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ALTEC Group — Advisory · Learning · Technology",
    template: "%s — ALTEC Group",
  },
  openGraph: { type: "website", siteName: "ALTEC Group" },
  twitter: { card: "summary_large_image" },
};

/**
 * Aplica el modo guardado antes de pintar. Sin esto la página arranca en
 * oscuro y salta a claro, y el salto se ve.
 */
const themeScript = `(function(){try{var m=localStorage.getItem("altec-theme");if(m==="light")document.documentElement.dataset.theme="light";}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const header = await headers();
  const raw = header.get("x-altec-locale") ?? defaultLocale;
  const locale = isLocale(raw) ? raw : defaultLocale;

  return (
    <html lang={localeHtmlLang[locale]} className={fontVariables}>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
