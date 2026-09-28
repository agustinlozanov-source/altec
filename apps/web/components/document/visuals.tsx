import {
  ArrowDown,
  ArrowRight,
  BarChart3,
  Bot,
  BookOpen,
  CircleAlert,
  Compass,
  Cpu,
  FileText,
  GraduationCap,
  Layers,
  LineChart,
  Microscope,
  Repeat,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";
import { CompanyLogo, type CompanyKey } from "@altec/ui";
import { Inline } from "./inline";

/**
 * Las piezas que sustituyen a una tabla plana cuando la tabla no es la mejor
 * forma de leer ese dato.
 *
 * Todas reciben el contenido ya parseado del Documento Maestro: no hay texto
 * escrito a mano aqui, solo la forma de presentarlo.
 */

/* --------------------------------------------------------------------------
 * Iconografia por bloque
 * ----------------------------------------------------------------------- */

export const CHAPTER_ICONS: Record<number, LucideIcon> = {
  1: FileText,
  2: TrendingUp,
  3: Layers,
  4: Bot,
  5: ShieldCheck,
  6: Target,
  7: Users,
  8: BarChart3,
  9: BookOpen,
};

/* --------------------------------------------------------------------------
 * Callouts
 * ----------------------------------------------------------------------- */

export function Callout({
  tone = "note",
  icon: Icon,
  title,
  children,
}: {
  tone?: "note" | "warning" | "quote";
  icon?: LucideIcon;
  title?: string;
  children: React.ReactNode;
}) {
  if (tone === "quote") {
    return (
      <blockquote className="border-accent-ink text-ink my-8 border-l-2 py-1 pl-6 text-lg leading-relaxed font-medium italic md:text-xl">
        {children}
      </blockquote>
    );
  }

  const warning = tone === "warning";
  const Glyph = Icon ?? (warning ? CircleAlert : FileText);

  return (
    <div
      className={`my-8 rounded-xl border p-5 md:p-6 ${
        warning ? "border-attention/40 bg-attention/8" : "border-line bg-card/50"
      }`}
    >
      <div className="flex gap-4">
        <span
          className={`mt-0.5 shrink-0 ${warning ? "text-attention" : "text-accent-ink"}`}
          aria-hidden
        >
          <Glyph size={20} />
        </span>
        <div className="min-w-0 flex-1">
          {title ? (
            <p className="text-ink font-mono text-xs font-semibold tracking-[0.12em] uppercase">
              {title}
            </p>
          ) : null}
          <div className={`text-read space-y-3 leading-relaxed ${title ? "mt-3" : ""}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Cifra grande con su etiqueta. Para los datos que deben verse, no leerse. */
export function StatGrid({
  stats,
}: {
  stats: { value: string; label: string; note?: string }[];
}) {
  return (
    <div className="border-line bg-card/40 my-8 grid gap-px overflow-hidden rounded-xl border md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-surface p-5 md:p-6">
          {/* Una cifra corta se pone enorme; una frase, no — a 4rem no cabe y
              se parte en cuatro renglones. El tamaño lo decide el contenido. */}
          <p
            className={`font-display text-ink leading-tight font-extrabold tracking-tight ${
              stat.value.length > 24 ? "text-lg md:text-xl" : "text-3xl md:text-4xl"
            }`}
          >
            {stat.value}
          </p>
          <p className="text-accent-ink mt-3 font-mono text-[0.7rem] tracking-[0.1em] uppercase">
            {stat.label}
          </p>
          {stat.note ? <p className="text-muted mt-2 text-sm leading-snug">{stat.note}</p> : null}
        </div>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Las cinco empresas
 * ----------------------------------------------------------------------- */

/** El orden y los nombres salen de la tabla; esto solo resuelve el logotipo. */
const COMPANY_KEYS: { match: RegExp; key: CompanyKey }[] = [
  { match: /flow\s*hub/i, key: "flowhub" },
  { match: /scalex/i, key: "scalex" },
  { match: /avalluo|quant/i, key: "avalluo" },
  { match: /boston|\bBSC\b/i, key: "boston" },
  { match: /photocan/i, key: "photocan" },
];

function companyKeyFor(name: string): CompanyKey | null {
  return COMPANY_KEYS.find((entry) => entry.match.test(name))?.key ?? null;
}

export function CompanyCards({ rows }: { rows: string[][] }) {
  const companies = rows
    .filter((row) => !(row[0] ?? "").includes("**"))
    .map((row) => ({
      name: (row[0] ?? "").trim(),
      industry: (row[1] ?? "").trim(),
      projection: (row[2] ?? "").trim(),
      key: companyKeyFor(row[0] ?? ""),
    }));

  return (
    <div className="my-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {companies.map((company) => (
        <article
          key={company.name}
          className="border-line bg-card/50 flex flex-col rounded-xl border p-5"
        >
          <div className="flex h-9 items-center">
            {company.key ? (
              <CompanyLogo company={company.key} className="h-7 w-auto max-w-[70%]" />
            ) : (
              <span className="font-display text-ink text-lg font-bold">{company.name}</span>
            )}
          </div>
          <p className="text-ink font-display mt-4 text-base font-semibold">{company.name}</p>
          <p className="text-muted mt-1 text-sm leading-snug">{company.industry}</p>
          {company.projection ? (
            <p className="border-line text-accent-ink mt-4 border-t pt-4 font-mono text-sm">
              {company.projection}
              <span className="text-muted ml-1.5 text-xs">proyección Año 1</span>
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * La categoria ALT
 * ----------------------------------------------------------------------- */

const ALT_STEPS: { letter: string; title: string; icon: LucideIcon; text: string }[] = [
  {
    letter: "A",
    title: "Advisory",
    icon: Compass,
    text: "Asesoría estratégica. Dónde está el problema y hacia dónde va la empresa.",
  },
  {
    letter: "L",
    title: "Learning",
    icon: GraduationCap,
    text: "Formación del equipo. Quien ejecuta el cambio tiene que saber ejecutarlo.",
  },
  {
    letter: "T",
    title: "Technology",
    icon: Cpu,
    text: "Tecnología aplicada. Lo que sostiene el cambio cuando el consultor se va.",
  },
];

export function AltCycle() {
  return (
    <div className="border-line bg-card/40 my-8 rounded-xl border p-6 md:p-8">
      <p className="text-accent-ink text-center font-mono text-xs tracking-[0.18em] uppercase">
        Un ciclo anual, tres fases inseparables
      </p>
      <div className="mt-8 flex flex-col items-stretch gap-4 md:flex-row md:items-center">
        {ALT_STEPS.map((step, index) => (
          <div key={step.letter} className="contents">
            <div className="border-line bg-surface flex-1 rounded-xl border p-5 text-center">
              <span
                className="bg-accent-ink text-on-accent font-display mx-auto flex h-11 w-11 items-center justify-center rounded-full text-xl font-extrabold"
                aria-hidden
              >
                {step.letter}
              </span>
              <p className="font-display text-ink mt-4 text-lg font-bold">{step.title}</p>
              <span className="text-accent-ink mt-3 flex justify-center" aria-hidden>
                <step.icon size={18} />
              </span>
              <p className="text-muted mt-3 text-sm leading-snug">{step.text}</p>
            </div>
            <span
              className="text-accent-ink flex shrink-0 justify-center md:block"
              aria-hidden={index < ALT_STEPS.length - 1 ? true : undefined}
              aria-label={index === ALT_STEPS.length - 1 ? "vuelve al inicio" : undefined}
            >
              {index === ALT_STEPS.length - 1 ? (
                <Repeat size={18} className="md:rotate-0" />
              ) : (
                <>
                  <ArrowDown size={18} className="md:hidden" />
                  <ArrowRight size={18} className="hidden md:block" />
                </>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * El flywheel de AltecVO
 * ----------------------------------------------------------------------- */

const VO_LAYERS: { label: string; title: string; icon: LucideIcon }[] = [
  { label: "Capa 1", title: "Operación diaria", icon: Settings },
  { label: "Capa 2", title: "Análisis", icon: LineChart },
  { label: "Capa 3", title: "I+D permanente", icon: Microscope },
];

const VO_CYCLE = [
  "Conclusiones originales",
  "Contenido (white papers, benchmarks, casos)",
  "Comunicación (publicaciones, conferencias)",
  "Posicionamiento (agenda, foros, medios)",
  "Oportunidades de negocio",
  "Nuevos datos de campo",
];

export function Flywheel() {
  return (
    <div className="border-line bg-card/40 my-8 rounded-xl border p-6 md:p-8">
      <p className="text-accent-ink font-mono text-xs tracking-[0.18em] uppercase">
        AltecVO — Agentes de IA
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {VO_LAYERS.map((layer, index) => (
          <div
            key={layer.label}
            className={`rounded-xl border p-4 ${
              index === 2 ? "border-accent-ink/50 bg-accent-ink/8" : "border-line bg-surface"
            }`}
          >
            <span className="text-accent-ink flex" aria-hidden>
              <layer.icon size={18} />
            </span>
            <p className="text-muted mt-3 font-mono text-[0.7rem] tracking-[0.1em] uppercase">
              {layer.label}
            </p>
            <p className="text-ink font-display mt-1 text-base font-semibold">{layer.title}</p>
          </div>
        ))}
      </div>

      <p className="text-muted mt-6 text-center font-mono text-xs">
        la tercera capa abre el ciclo
      </p>

      {/* El riel de la izquierda cierra el bucle: lo que sale por abajo vuelve
          a entrar por arriba. */}
      <ol className="border-accent-ink/30 relative mt-4 space-y-3 border-l-2 pl-6">
        {VO_CYCLE.map((step, index) => (
          <li key={step} className="relative">
            <span
              aria-hidden
              className="bg-accent-ink text-on-accent absolute top-1/2 -left-[1.9rem] flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full font-mono text-[0.65rem] font-bold"
            >
              {index + 1}
            </span>
            <p className="border-line bg-surface text-read rounded-lg border px-4 py-2.5 text-sm">
              {step}
            </p>
          </li>
        ))}
      </ol>

      <p className="text-accent-ink mt-4 flex items-center gap-2 font-mono text-xs">
        <Repeat size={14} aria-hidden />
        los datos de campo alimentan la siguiente ronda de investigación
      </p>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * DX21 — 7 pilares x 3 lentes
 * ----------------------------------------------------------------------- */

const DX21_PILLARS = [
  "Liderazgo y Gobernanza",
  "Estrategia y Dirección",
  "Clientes y Mercado",
  "Talento y Cultura",
  "Operaciones y Procesos",
  "Innovación y Tecnología",
  "Desempeño Financiero",
];

const DX21_LENSES = ["Diseño", "Despliegue", "Desempeño"];

export function Dx21Grid() {
  return (
    <div className="border-line bg-card/40 doc-scroll my-8 overflow-x-auto rounded-xl border p-5 md:p-6">
      <div className="min-w-[30rem]">
        <div className="grid grid-cols-[minmax(11rem,1.4fr)_repeat(3,1fr)] gap-px">
          <div />
          {DX21_LENSES.map((lens) => (
            <div
              key={lens}
              className="text-accent-ink pb-3 text-center font-mono text-[0.7rem] tracking-[0.1em] uppercase"
            >
              {lens}
            </div>
          ))}

          {DX21_PILLARS.map((pillar) => (
            <div key={pillar} className="contents">
              <div className="border-line text-ink flex items-center border-t py-3 pr-4 text-sm font-medium">
                {pillar}
              </div>
              {DX21_LENSES.map((lens) => (
                <div
                  key={lens}
                  className="border-line flex items-center justify-center border-t py-3"
                >
                  <span
                    className="bg-accent-ink/70 h-2.5 w-2.5 rounded-full"
                    aria-label={`${pillar} · ${lens}`}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="text-muted border-line mt-5 border-t pt-4 text-center font-mono text-xs">
        7 pilares × 3 lentes = 21 puntos de evaluación · 41 dimensiones · 164 sub-dimensiones
      </p>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Escalera de niveles de consultoria
 * ----------------------------------------------------------------------- */

export function ConsultingLadder({ rows }: { rows: string[][] }) {
  return (
    <div className="my-8 space-y-2">
      {rows.map((row, index) => {
        const level = (row[0] ?? "").trim();
        const role = (row[1] ?? "").trim();
        const does = (row[2] ?? "").trim();
        const time = (row[3] ?? "").trim();
        // Cada peldaño entra un poco mas: la escalera se ve antes de leerse.
        const indent = `${index * 1.5}rem`;

        return (
          <div
            key={level + role}
            style={{ marginInlineStart: indent }}
            className="border-line bg-card/50 flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-xl border p-4"
          >
            <span className="bg-accent-ink text-on-accent shrink-0 rounded-md px-2 py-0.5 font-mono text-xs font-bold">
              {level}
            </span>
            <span className="font-display text-ink text-base font-bold">{role}</span>
            {time ? <span className="text-muted ml-auto font-mono text-xs">{time}</span> : null}
            <p className="text-read w-full text-sm leading-snug">
              <Inline text={does} />
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Cadencia de gobierno y derechos del inversionista
 * ----------------------------------------------------------------------- */

export function CadenceCards({ rows }: { rows: string[][] }) {
  return (
    <div className="my-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {rows.map((row) => (
        <article key={row[0]} className="border-line bg-card/50 rounded-xl border p-5">
          <p className="text-accent-ink font-display text-2xl leading-none font-extrabold">
            {(row[1] ?? "").replace(/\*\*/g, "")}
          </p>
          <p className="font-display text-ink mt-3 text-base font-bold">
            <Inline text={row[0] ?? ""} />
          </p>
          <p className="text-muted border-line mt-3 border-t pt-3 font-mono text-xs">
            {(row[2] ?? "").replace(/\*\*/g, "")} · {(row[3] ?? "").replace(/\*\*/g, "")}
          </p>
          <p className="text-read mt-3 text-sm leading-snug">
            <Inline text={row[4] ?? ""} />
          </p>
        </article>
      ))}
    </div>
  );
}

export function RightsCards({
  rows,
  icons,
}: {
  rows: string[][];
  icons: LucideIcon[];
}) {
  return (
    <div className="my-8 grid gap-4 md:grid-cols-2">
      {rows.map((row, index) => {
        const Icon = icons[index % icons.length] ?? ShieldCheck;
        return (
          <article key={row[0]} className="border-line bg-card/50 rounded-xl border p-5">
            <span className="text-accent-ink flex" aria-hidden>
              <Icon size={20} />
            </span>
            <p className="font-display text-ink mt-4 text-base font-bold">
              <Inline text={row[0] ?? ""} />
            </p>
            <p className="text-read mt-2 text-sm leading-relaxed">
              <Inline text={row[1] ?? ""} />
            </p>
          </article>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Timeline del horizonte completo
 * ----------------------------------------------------------------------- */

export function HorizonTimeline({ rows }: { rows: string[][] }) {
  return (
    <div className="border-line bg-card/40 my-8 rounded-xl border p-6 md:p-8">
      <ol className="relative grid gap-8 md:grid-cols-5 md:gap-4">
        {/* El riel: vertical en móvil, horizontal a partir de md. */}
        <span
          aria-hidden
          className="bg-line-strong absolute top-0 bottom-0 left-[0.34rem] w-px md:top-[0.34rem] md:right-0 md:bottom-auto md:left-0 md:h-px md:w-auto"
        />
        {rows.map((row, index) => {
          const year = (row[0] ?? "").replace(/\*\*/g, "").trim();
          const milestone = (row[1] ?? "").trim();
          const last = index === rows.length - 1;

          return (
            <li key={year} className="relative pl-7 md:pt-7 md:pl-0">
              <span
                aria-hidden
                className={`absolute top-1 left-0 h-3 w-3 rounded-full md:top-0 md:left-0 ${
                  last ? "bg-accent-ink ring-accent-ink/25 ring-4" : "bg-accent-ink"
                }`}
              />
              <p className="font-display text-ink text-xl leading-none font-extrabold md:text-2xl">
                {year}
              </p>
              <p className="text-read mt-2 text-sm leading-snug">
                <Inline text={milestone} />
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Los cinco niveles del embudo
 * ----------------------------------------------------------------------- */

/** "**NIVEL 1: RECONOCIMIENTO** Texto. → a. → b." -> partes. */
function splitLabelled(text: string): { label: string; lead: string; points: string[] } {
  const match = /^\*\*(.+?)\*\*\s*(.*)$/s.exec(text.trim());
  const label = match?.[1]?.trim() ?? "";
  const body = (match?.[2] ?? text).trim();
  const [lead, ...points] = body.split("→").map((part) => part.trim());
  return { label, lead: lead ?? "", points: points.filter(Boolean) };
}

export function FunnelSteps({
  paragraphs,
  icons,
}: {
  paragraphs: string[];
  icons: LucideIcon[];
}) {
  return (
    <div className="my-8 space-y-3">
      {paragraphs.map((paragraph, index) => {
        const { label, lead, points } = splitLabelled(paragraph);
        const Icon = icons[index % icons.length] ?? Target;
        // El embudo se estrecha: cada nivel es un poco mas angosto que el anterior.
        const width = `${100 - index * 6}%`;

        return (
          <div
            key={label}
            style={{ maxWidth: width }}
            className="border-line bg-card/50 mx-auto rounded-xl border p-5"
          >
            <div className="flex items-center gap-3">
              <span className="text-accent-ink shrink-0" aria-hidden>
                <Icon size={18} />
              </span>
              <p className="font-display text-ink text-sm font-bold tracking-wide">{label}</p>
            </div>
            {lead ? <p className="text-read mt-3 text-sm leading-snug">{lead}</p> : null}
            {points.length > 0 ? (
              <ul className="mt-3 space-y-1.5">
                {points.map((point) => (
                  <li key={point} className="text-muted flex gap-2 text-sm leading-snug">
                    <span className="text-accent-ink shrink-0" aria-hidden>
                      <ArrowRight size={14} className="mt-1" />
                    </span>
                    <span>
                      <Inline text={point} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/** Los cinco fragmentos de la base. Mismo formato de origen que el embudo. */
export function FragmentCards({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="my-8 grid gap-4 md:grid-cols-2">
      {paragraphs.map((paragraph) => {
        const { label, lead } = splitLabelled(paragraph);
        return (
          <article key={label} className="border-line bg-card/50 rounded-xl border p-5">
            <p className="font-display text-ink text-base leading-snug font-bold">{label}</p>
            <p className="text-read mt-3 text-sm leading-relaxed">
              <Inline text={lead} />
            </p>
          </article>
        );
      })}
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Embudo comercial
 * ----------------------------------------------------------------------- */

/**
 * El embudo, como embudo.
 *
 * No se dibuja con Chart.js porque en escala lineal la primera etapa (500) deja
 * a la ultima (1.5) en un pixel. El ancho va con una raiz para que las etapas
 * pequeñas sigan viendose; las cifras exactas van escritas encima, que es lo
 * que de verdad se lee. El pie lo advierte para que nadie mida con la regla.
 */
export function FunnelChart({
  stages,
}: {
  stages: { label: string; value: number; display: string; rate?: string }[];
}) {
  const max = Math.max(...stages.map((stage) => stage.value));

  return (
    <figure className="border-line bg-card/40 my-8 rounded-xl border p-5 md:p-6">
      <div className="space-y-1">
        {stages.map((stage, index) => {
          const width = Math.pow(stage.value / max, 0.3) * 100;
          return (
            <div key={stage.label}>
              {index > 0 && stage.rate ? (
                <p className="text-muted py-1 text-center font-mono text-[0.7rem]">
                  ↓ {stage.rate}
                </p>
              ) : null}
              <div className="flex items-center gap-4">
                <div className="h-11 flex-1">
                  <div
                    style={{ width: `${width}%` }}
                    className="bg-accent-ink/80 flex h-full min-w-[4.5rem] items-center rounded-md px-3"
                  >
                    <span className="text-on-accent truncate font-mono text-xs font-bold">
                      {stage.display}
                    </span>
                  </div>
                </div>
                <p className="text-read w-[40%] shrink-0 text-sm leading-snug md:w-[34%]">
                  {stage.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <figcaption className="text-muted border-line mt-5 border-t pt-3 text-center font-mono text-xs">
        El ancho está comprimido para que las últimas etapas sigan siendo visibles. Las cifras
        exactas son las de la tabla de arriba.
      </figcaption>
    </figure>
  );
}
