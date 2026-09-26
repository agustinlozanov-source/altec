import type { Company } from "@/lib/companies";

/**
 * Card de empresa (docs/WEB.md §4.1).
 * El logo va en capsula negra redondeada, como en el sales pitch. Mientras no
 * lleguen los SVG (packages/ui/brand/empresas/), la capsula lleva el nombre
 * compuesto tipograficamente.
 */
export function CompanyCard({ company }: { company: Company }) {
  return (
    <article className="border-line bg-card rounded-card hover:border-altec-green/40 flex flex-col gap-4 border p-6 transition-colors">
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
        className="text-accent-ink hover:text-accent-ink/80 mt-auto text-sm font-semibold"
      >
        Visitar sitio →
      </a>
    </article>
  );
}
