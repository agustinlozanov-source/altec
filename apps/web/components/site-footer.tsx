import Link from "next/link";
import { AltecLockup, Container } from "@altec/ui";
import { companies } from "@/lib/companies";
import { nav, phaseOneRoutes, site } from "@/lib/site";

/** Footer (docs/WEB.md §3). */
export function SiteFooter() {
  return (
    <footer className="bg-surface border-line border-t py-14">
      <Container className="grid gap-10 md:grid-cols-3">
        <div className="flex flex-col gap-4">
          <AltecLockup />
          <p className="text-muted max-w-xs text-sm">
            {site.address}
            <br />
            <a href={`mailto:${site.email}`} className="hover:text-ink">
              {site.email}
            </a>
          </p>
        </div>

        <nav aria-label="Navegación del sitio" className="flex flex-col gap-2">
          <h2 className="text-ink mb-1 text-xs tracking-[0.18em] uppercase">Sitio</h2>
          {nav.map((item) =>
            phaseOneRoutes.has(item.href) ? (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted hover:text-ink text-sm"
              >
                {item.label}
              </Link>
            ) : (
              <span key={item.href} className="text-muted text-sm">
                {item.label}
              </span>
            ),
          )}
          <a
            href={site.investorPortalUrl}
            className="text-accent-ink hover:text-accent-ink/80 text-sm"
          >
            Portal Inversionista
          </a>
        </nav>

        <nav aria-label="Empresas del grupo" className="flex flex-col gap-2">
          <h2 className="text-ink mb-1 text-xs tracking-[0.18em] uppercase">Empresas</h2>
          {companies.map((company) => (
            <a
              key={company.key}
              href={company.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-muted hover:text-ink text-sm"
            >
              {company.name}
            </a>
          ))}
        </nav>
      </Container>

      <Container className="border-line mt-12 border-t pt-6">
        <p className="text-muted text-xs">
          {site.legalName} — CDMX, México. Toda la información de este sitio es confidencial y
          propiedad del grupo.
        </p>
      </Container>
    </footer>
  );
}
