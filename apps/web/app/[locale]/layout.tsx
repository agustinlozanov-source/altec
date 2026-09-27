import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getDictionary, isLocale, locales, type Locale } from "@/lib/i18n";

/** Se generan las dos versiones en el build; no hay idiomas dinámicos. */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = getDictionary(locale as Locale);

  return (
    <>
      <a
        href="#contenido"
        className="bg-altec-green text-on-accent sr-only rounded-b px-4 py-2 text-sm font-semibold focus:not-sr-only focus:absolute focus:top-0 focus:left-4 focus:z-50"
      >
        {dictionary.nav.skipToContent}
      </a>
      <SiteHeader locale={locale as Locale} dictionary={dictionary} />
      <main id="contenido">{children}</main>
      <SiteFooter locale={locale as Locale} dictionary={dictionary} />
    </>
  );
}
