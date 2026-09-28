"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

/**
 * El glosario del Anexo B.
 *
 * Son mas de sesenta terminos en cinco categorias. Como tabla larga no se usa:
 * a un glosario se le pregunta por un termino concreto, asi que lleva busqueda
 * y filtro. Las definiciones son las del documento, sin recortar.
 */

export type GlossaryGroup = {
  category: string;
  terms: { term: string; definition: string }[];
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\*\*/g, "")
    .toLowerCase();
}

export function Glossary({ groups }: { groups: GlossaryGroup[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const total = useMemo(
    () => groups.reduce((sum, group) => sum + group.terms.length, 0),
    [groups],
  );

  const results = useMemo(() => {
    const needle = normalize(query.trim());
    return groups
      .filter((group) => category === null || group.category === category)
      .map((group) => ({
        ...group,
        terms: needle
          ? group.terms.filter(
              (entry) =>
                normalize(entry.term).includes(needle) ||
                normalize(entry.definition).includes(needle),
            )
          : group.terms,
      }))
      .filter((group) => group.terms.length > 0);
  }, [groups, query, category]);

  const shown = results.reduce((sum, group) => sum + group.terms.length, 0);

  return (
    <div className="my-8">
      <div className="border-line bg-card/40 rounded-xl border p-4 md:p-5">
        <label className="relative block">
          <span className="sr-only">Buscar un término del glosario</span>
          <span
            className="text-muted pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
            aria-hidden
          >
            <Search size={16} />
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Buscar entre ${total} términos…`}
            className="border-line bg-surface text-ink placeholder:text-muted focus:border-accent-ink w-full rounded-lg border py-2.5 pr-10 pl-10 text-sm outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted hover:text-ink absolute top-1/2 right-3 -translate-y-1/2"
              aria-label="Limpiar la búsqueda"
            >
              <X size={16} />
            </button>
          ) : null}
        </label>

        <div className="mt-3 flex flex-wrap gap-2">
          <FilterChip active={category === null} onClick={() => setCategory(null)}>
            Todos
          </FilterChip>
          {groups.map((group) => (
            <FilterChip
              key={group.category}
              active={category === group.category}
              onClick={() => setCategory(group.category)}
            >
              {group.category}
            </FilterChip>
          ))}
        </div>
      </div>

      <p className="text-muted mt-4 font-mono text-xs" role="status" aria-live="polite">
        {shown === total ? `${total} términos` : `${shown} de ${total} términos`}
      </p>

      {results.length === 0 ? (
        <p className="border-line text-muted mt-4 rounded-xl border border-dashed p-8 text-center text-sm">
          Ningún término coincide con “{query}”.
        </p>
      ) : (
        <div className="mt-4 space-y-8">
          {results.map((group) => (
            <section key={group.category}>
              <h4 className="text-accent-ink border-line border-b pb-2 font-mono text-xs tracking-[0.12em] uppercase">
                {group.category}
              </h4>
              <dl className="mt-4 space-y-4">
                {group.terms.map((entry) => (
                  <div
                    key={entry.term}
                    className="border-line bg-card/40 rounded-xl border p-4 md:p-5"
                  >
                    <dt className="font-display text-ink text-base font-bold">
                      {entry.term.replace(/\*\*/g, "")}
                    </dt>
                    <dd className="text-read mt-2 text-sm leading-relaxed">
                      {renderDefinition(entry.definition)}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/** Las definiciones traen negritas y cursivas; esto es la version minima. */
function renderDefinition(text: string) {
  return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index} className="text-ink font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return <span key={index}>{part}</span>;
  });
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
        active
          ? "border-accent-ink bg-accent-ink text-on-accent font-semibold"
          : "border-line text-muted hover:border-line-strong hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
