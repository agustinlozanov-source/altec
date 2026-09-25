"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AltecLogo, Button, cn, Container } from "@altec/ui";
import { nav, phaseOneRoutes, site } from "@/lib/site";

/**
 * Navbar fija, fondo negro semitransparente con backdrop-blur (docs/WEB.md §3).
 * Las rutas que todavia no existen (Fase 2) se muestran apagadas en lugar de
 * enlazar a un 404.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-altec-black/80 border-altec-cream/10 sticky top-0 z-40 border-b backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="ALTEC Group, ir al inicio" className="shrink-0">
          <AltecLogo className="text-xl" />
        </Link>

        <nav aria-label="Navegación principal" className="hidden items-center gap-7 lg:flex">
          {nav.map((item) => {
            const available = phaseOneRoutes.has(item.href);
            const active = pathname === item.href;

            if (!available) {
              return (
                <span
                  key={item.href}
                  title="Próximamente — Fase 2"
                  className="text-altec-mid-gray cursor-default text-sm"
                >
                  {item.label}
                </span>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "hover:text-altec-green text-sm transition-colors",
                  active ? "text-altec-green" : "text-altec-cream",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button href={site.investorPortalUrl} size="sm">
            Portal Inversionista
          </Button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            className="text-altec-cream -mr-2 p-2 lg:hidden"
          >
            <span aria-hidden="true" className="block text-lg leading-none">
              {open ? "✕" : "☰"}
            </span>
          </button>
        </div>
      </Container>

      <div
        id="menu-movil"
        hidden={!open}
        className="border-altec-cream/10 bg-altec-black border-t lg:hidden"
      >
        <Container className="flex flex-col gap-1 py-4">
          {nav.map((item) => {
            const available = phaseOneRoutes.has(item.href);

            return available ? (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="hover:text-altec-green text-altec-cream py-2 text-base"
              >
                {item.label}
              </Link>
            ) : (
              <span key={item.href} className="text-altec-mid-gray py-2 text-base">
                {item.label}
                <span className="ml-2 text-xs">· próximamente</span>
              </span>
            );
          })}


        </Container>
      </div>
    </header>
  );
}
