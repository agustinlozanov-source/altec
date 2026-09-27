import Link from "next/link";
import { AltecLockup, Container } from "@altec/ui";
import { companies } from "@/lib/companies";
import { nav, phaseOneRoutes, site } from "@/lib/site";

/** Footer institucional en cuatro columnas (docs/WEB.md §3). */
export function SiteFooter() {
  return (
    <footer className="surface-base bg-surface border-line border-t py-16 md:py-20">
      <Container className="grid gap-12 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.2fr]">
        <div className="flex flex-col gap-5">
          <AltecLockup />
          <p className="text-muted max-w-xs text-sm leading-relaxed">
            Advisory · Learning · Technology.
            <br />
            Un holding, cinco empresas, una categoría nueva.
          </p>
        </div>

        <nav aria-label="Navegación del sitio" className="flex flex-col gap-3">
          <h2 className="text-ink text-xs font-semibold tracking-[0.12em] uppercase">Sitio</h2>
          {nav.map((item) =>
            phaseOneRoutes.has(item.href) ? (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted hover:text-accent-ink text-sm transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span key={item.href} className="text-muted text-sm opacity-50">
                {item.label}
              </span>
            ),
          )}
        </nav>

        <nav aria-label="Empresas del grupo" className="flex flex-col gap-3">
          <h2 className="text-ink text-xs font-semibold tracking-[0.12em] uppercase">Empresas</h2>
          {companies.map((company) => (
            <a
              key={company.key}
              href={company.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-muted hover:text-accent-ink text-sm transition-colors"
            >
              {company.name}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <h2 className="text-ink text-xs font-semibold tracking-[0.12em] uppercase">Contacto</h2>
          <p className="text-muted text-sm leading-relaxed">{site.address}</p>
          <a
            href={`mailto:${site.email}`}
            className="text-muted hover:text-accent-ink text-sm transition-colors"
          >
            {site.email}
          </a>
          <a
            href={site.investorPortalUrl}
            className="text-accent-ink mt-2 text-sm font-semibold"
          >
            Portal Inversionista →
          </a>
        </div>
      </Container>

      <Container className="border-line mt-14 border-t pt-6">
        <p className="text-muted text-xs">
          © 2026 {site.legalName} — CDMX, México. Toda la información de este sitio es
          confidencial y propiedad del grupo.
        </p>
      </Container>
    </footer>
  );
}
