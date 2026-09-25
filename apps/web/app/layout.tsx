import type { Metadata } from "next";
import { fontVariables } from "@altec/ui/fonts";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const description =
  "Grupo empresarial que integra consultoría, educación y tecnología para escalar PyMEs " +
  "en Latinoamérica. 5 empresas, un holding, una categoría nueva.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ALTEC Group — Advisory · Learning · Technology",
    template: "%s — ALTEC Group",
  },
  description,
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "ALTEC Group",
    title: "ALTEC Group — Advisory · Learning · Technology",
    description,
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX" className={fontVariables}>
      <body>
        <a
          href="#contenido"
          className="bg-altec-green text-altec-black sr-only rounded-b px-4 py-2 text-sm font-semibold focus:not-sr-only focus:absolute focus:top-0 focus:left-4 focus:z-50"
        >
          Saltar al contenido
        </a>
        <SiteHeader />
        <main id="contenido">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
