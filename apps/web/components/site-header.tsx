"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AltecLogo, Button, cn, Container } from "@altec/ui";
import { LanguageSwitcher } from "@/components/language-switcher";
import { path, type Dictionary, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

/**
 * Navbar fija, fondo semitransparente con desenfoque (docs/WEB.md §3).
 * Las rutas que todavía no existen se muestran apagadas en lugar de enlazar
 * a un 404.
 */
export function SiteHeader({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const items = [
    { key: "home", href: path(locale, "home"), label: dictionary.nav.home, ready: true },
    { key: "about", href: path(locale, "about"), label: dictionary.nav.about, ready: true },
    {
      key: "companies",
      href: path(locale, "companies"),
      label: dictionary.nav.companies,
      ready: false,
    },
    {
      key: "consulting",
      href: path(locale, "consulting"),
      label: dictionary.nav.consulting,
      ready: false,
    },
    {
      key: "vo",
      href: path(locale, "virtualOffice"),
      label: dictionary.nav.virtualOffice,
      ready: true,
    },
    { key: "contact", href: path(locale, "contact"), label: dictionary.nav.contact, ready: true },
  ];

  return (
    <header className="surface-invert sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href={path(locale, "home")} aria-label="ALTEC Group" className="shrink-0">
          <AltecLogo className="h-6 md:h-7" alt="" priority />
        </Link>

        <nav aria-label={dictionary.nav.home} className="hidden items-center gap-7 lg:flex">
          {items.map((item) => {
            const active = pathname === item.href;

            if (!item.ready) {
              return (
                <span
                  key={item.key}
                  title={dictionary.nav.comingSoon}
                  className="text-muted cursor-default text-sm opacity-60"
                >
                  {item.label}
                </span>
              );
            }

            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "hover:text-accent-ink text-sm transition-colors",
                  active ? "text-accent-ink" : "text-ink",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher locale={locale} label={dictionary.nav.language} />

          <span className="hidden md:inline-flex">
            <Button href={site.investorPortalUrl} size="sm">
              {dictionary.nav.investorPortal}
            </Button>
          </span>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? dictionary.nav.closeMenu : dictionary.nav.openMenu}
            className="text-ink -mr-2 p-2 lg:hidden"
          >
            <span aria-hidden="true" className="block text-lg leading-none">
              {open ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </Container>

      <div id="menu-movil" hidden={!open} className="border-t border-white/10 bg-black lg:hidden">
        <Container className="flex flex-col gap-1 py-4">
          {items.map((item) =>
            item.ready ? (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                className="hover:text-accent-ink text-ink py-2 text-base"
              >
                {item.label}
              </Link>
            ) : (
              <span key={item.key} className="text-muted py-2 text-base opacity-60">
                {item.label}
                <span className="ml-2 text-xs">· {dictionary.nav.comingSoon}</span>
              </span>
            ),
          )}

          <span className="mt-3 inline-flex md:hidden">
            <Button href={site.investorPortalUrl}>{dictionary.nav.investorPortal}</Button>
          </span>
        </Container>
      </div>
    </header>
  );
}
