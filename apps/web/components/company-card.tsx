import { CompanyLogo } from "@altec/ui";
import { Reveal } from "@/components/reveal";
import type { Company } from "@/lib/companies";

/**
 * Card de empresa (docs/WEB.md §4.1).
 * El logotipo real sustituye a la cápsula tipográfica que servía de
 * provisional; el nombre queda como texto accesible en la imagen.
 */
export function CompanyCard({ company, delay = 0 }: { company: Company; delay?: number }) {
  return (
    <Reveal
      as="article"
      delay={delay}
      className="border-line bg-card rounded-card hover:border-accent-ink group flex flex-col gap-5 border p-6 transition-colors hover:shadow-[0_8px_32px_rgb(0_0_0/0.28)] md:p-8"
    >
      <CompanyLogo company={company.key} className="h-7 md:h-8" />

      <p className="text-muted text-sm">{company.industry}</p>

      <p className="text-ink font-mono text-sm leading-relaxed">{company.metric}</p>

      <a
        href={company.url}
        target="_blank"
        rel="noreferrer noopener"
        className="text-ink group-hover:text-accent-ink mt-auto inline-flex items-center gap-2 text-sm font-semibold transition-colors"
      >
        Visitar sitio
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
          →
        </span>
      </a>
    </Reveal>
  );
}
