import { Reveal } from "@/components/reveal";
import type { Company } from "@/lib/companies";

/**
 * Card de empresa (docs/WEB.md §4.1).
 * El logo va en capsula redondeada, como en el sales pitch. Mientras no lleguen
 * los SVG (packages/ui/brand/empresas/), la capsula lleva el nombre compuesto.
 */
export function CompanyCard({ company, delay = 0 }: { company: Company; delay?: number }) {
  return (
    <Reveal
      as="article"
      delay={delay}
      className="border-line bg-card rounded-card hover:border-accent-ink group flex flex-col gap-4 border p-6 transition-colors hover:shadow-[0_8px_32px_rgb(0_0_0/0.08)] md:p-8"
    >
      <div className="rounded-pill bg-surface border-line inline-flex w-fit items-center border px-5 py-2.5">
        <span className="font-display text-ink text-base font-extrabold italic">
          {company.name}
        </span>
      </div>

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
