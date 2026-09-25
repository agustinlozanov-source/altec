import Link from "next/link";
import { AltecLockup, Container } from "@altec/ui";
import { companies } from "@/lib/companies";
import { nav, phaseOneRoutes, site } from "@/lib/site";

/** Footer (docs/WEB.md §3). */
export function SiteFooter() {
  return (
    <footer className="bg-altec-black border-altec-cream/10 border-t py-14">
      <Container className="grid gap-10 md:grid-cols-3">
        <div className="flex flex-col gap-4">
          <AltecLockup />
          <p className="text-altec-mid-gray max-w-xs text-sm">
            {site.address}
            <br />
            <a href={`mailto:${site.email}`} className="hover:text-altec-cream">
              {site.email}
            </a>
          </p>
        </div>

        <nav aria-label="Navegación del sitio" className="flex flex-col gap-2">
          <h2 className="text-altec-cream mb-1 text-xs tracking-[0.18em] uppercase">Sitio</h2>
          {nav.map((item) =>
            phaseOneRoutes.has(item.href) ? (
              <Link
                key={item.href}
                href={item.href}
                className="text-altec-mid-gray hover:text-altec-cream text-sm"
              >
                {item.label}
              </Link>
            ) : (
              <span key={item.href} className="text-altec-mid-gray/50 text-sm">
                {item.label}
              </span>
            ),
          )}
          <a
            href={site.investorPortalUrl}
            className="text-altec-green hover:text-altec-green/80 text-sm"
          >
            Portal Inversionista
          </a>
        </nav>

        <nav aria-label="Empresas del grupo" className="flex flex-col gap-2">
          <h2 className="text-altec-cream mb-1 text-xs tracking-[0.18em] uppercase">Empresas</h2>
          {companies.map((company) => (
            <a
              key={company.key}
              href={company.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-altec-mid-gray hover:text-altec-cream text-sm"
            >
              {company.name}
            </a>
          ))}
        </nav>
      </Container>

      <Container className="border-altec-cream/10 mt-12 border-t pt-6">
        <p className="text-altec-mid-gray text-xs">
          {site.legalName} — CDMX, México. Toda la información de este sitio es confidencial y
          propiedad del grupo.
        </p>
      </Container>
    </footer>
  );
}
