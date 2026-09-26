import { cn } from "@altec/ui";

/** El ciclo ALT (docs/WEB.md §4.1): Advisory -> Learning -> Technology -> Advisory. */
const stages = [
  { letter: "A", name: "Advisory", detail: "Consultoría estratégica, comercial y tecnológica." },
  { letter: "L", name: "Learning", detail: "Educación ejecutiva, certificaciones y eventos." },
  { letter: "T", name: "Technology", detail: "Plataformas SaaS, automatización y agentes de IA." },
];

export function AltCycle({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <ol className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-stretch">
        {stages.map((stage, index) => (
          <li
            key={stage.name}
            className="flex flex-col items-center gap-3 lg:flex-1 lg:flex-row lg:items-stretch"
          >
            <div className="border-line bg-card rounded-card w-full border p-6 lg:flex-1">
              <span
                aria-hidden="true"
                className="font-display text-ink/20 block text-4xl leading-none font-extrabold italic"
              >
                {stage.letter}
              </span>
              <h3 className="font-display text-ink mt-3 text-xl font-extrabold italic">
                {stage.name}
              </h3>
              <p className="text-muted mt-2 text-sm">{stage.detail}</p>
            </div>

            {index < stages.length - 1 ? (
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
        Y el ciclo vuelve a empezar en Advisory.
      </p>
    </div>
  );
}
