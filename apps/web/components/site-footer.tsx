import Link from "next/link";
import { AltecLockup, Container } from "@altec/ui";
import { companies } from "@/lib/companies";
import { path, type Dictionary, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";

/** Footer institucional en cuatro columnas (docs/WEB.md §3). */
export function SiteFooter({ locale, dictionary }: { locale: Locale; dictionary: Dictionary }) {
  const links = [
    { href: path(locale, "home"), label: dictionary.nav.home, ready: true },
    { href: path(locale, "about"), label: dictionary.nav.about, ready: true },
    { href: path(locale, "companies"), label: dictionary.nav.companies, ready: false },
    { href: path(locale, "consulting"), label: dictionary.nav.consulting, ready: false },
    { href: path(locale, "virtualOffice"), label: dictionary.nav.virtualOffice, ready: true },
    { href: path(locale, "contact"), label: dictionary.nav.contact, ready: true },
  ];

  return (
    <footer className="surface-base bg-surface border-line border-t py-16 md:py-20">
      <Container className="grid gap-12 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.2fr]">
        <div className="flex flex-col gap-5">
          <AltecLockup />
          <p className="text-muted max-w-xs text-sm leading-relaxed">
            {dictionary.footer.tagline}
            <br />
            {dictionary.footer.tagline2}
          </p>
        </div>

        <nav aria-label={dictionary.footer.site} className="flex flex-col gap-3">
          <h2 className="text-ink text-xs font-semibold tracking-[0.12em] uppercase">
            {dictionary.footer.site}
          </h2>
          {links.map((item) =>
            item.ready ? (
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

        <nav aria-label={dictionary.footer.companies} className="flex flex-col gap-3">
          <h2 className="text-ink text-xs font-semibold tracking-[0.12em] uppercase">
            {dictionary.footer.companies}
          </h2>
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
          <h2 className="text-ink text-xs font-semibold tracking-[0.12em] uppercase">
            {dictionary.footer.contact}
          </h2>
          <p className="text-muted text-sm leading-relaxed">{site.address}</p>
          <a
            href={`mailto:${site.email}`}
            className="text-muted hover:text-accent-ink text-sm transition-colors"
          >
            {site.email}
          </a>
          <a href={site.investorPortalUrl} className="text-accent-ink mt-2 text-sm font-semibold">
            {dictionary.nav.investorPortal} →
          </a>
        </div>
      </Container>

      <Container className="border-line mt-14 border-t pt-6">
        <p className="text-muted text-xs">
          © 2026 {site.legalName} {dictionary.footer.legal}
        </p>
      </Container>
    </footer>
  );
}
