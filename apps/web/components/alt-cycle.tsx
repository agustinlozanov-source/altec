import { cn } from "@altec/ui";
import type { Dictionary } from "@/lib/i18n";

/** El ciclo ALT (docs/WEB.md §4.1): Advisory → Learning → Technology → Advisory. */
export function AltCycle({
  dictionary,
  className,
}: {
  dictionary: Dictionary;
  className?: string;
}) {
  const { stages, cycleNote } = dictionary.home.differentiator;

  const items = [
    { letter: "A", name: "Advisory", detail: stages.advisory },
    { letter: "L", name: "Learning", detail: stages.learning },
    { letter: "T", name: "Technology", detail: stages.technology },
  ];

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <ol className="flex flex-col items-stretch gap-3 lg:flex-row">
        {items.map((stage, index) => (
          <li
            key={stage.name}
            className="flex flex-col items-center gap-3 lg:flex-1 lg:flex-row lg:items-stretch"
          >
            <div className="border-line bg-card rounded-card w-full border p-6 lg:flex-1">
              <span
                aria-hidden="true"
                className="font-display text-muted block text-4xl leading-none font-extrabold opacity-40"
              >
                {stage.letter}
              </span>
              <h3 className="font-display text-ink mt-3 text-xl font-extrabold">{stage.name}</h3>
              <p className="text-muted mt-2 text-sm">{stage.detail}</p>
            </div>

            {index < items.length - 1 ? (
              <span
                aria-hidden="true"
                className="text-accent-ink flex shrink-0 rotate-90 items-center text-2xl lg:rotate-0"
              >
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      <p className="text-muted flex items-center gap-2 font-mono text-xs">
        <span aria-hidden="true" className="text-accent-ink">
          ↻
        </span>
        {cycleNote}
      </p>
    </div>
  );
}
