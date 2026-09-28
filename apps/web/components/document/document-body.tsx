import type { ReactNode } from "react";
import {
  ClipboardList,
  GraduationCap,
  HandCoins,
  Handshake,
  Rocket,
  Scan,
  Share2,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { Block, DocChapter, DocSection } from "@/lib/document/markdown";
import { DocBlock, DocBlocks, DocTable } from "./prose";
import { DocChart } from "./chart";
import { Glossary, type GlossaryGroup } from "./glossary";
import { FUNNEL_STAGES, TABLE_CHARTS } from "./enhancements";
import {
  AltCycle,
  CadenceCards,
  Callout,
  CHAPTER_ICONS,
  CompanyCards,
  ConsultingLadder,
  Dx21Grid,
  Flywheel,
  FragmentCards,
  FunnelChart,
  FunnelSteps,
  HorizonTimeline,
  RightsCards,
  StatGrid,
} from "./visuals";

/**
 * El cuerpo del documento.
 *
 * Recorre lo que salio del parser y decide como se ve cada pieza. El texto no
 * se toca en ningun punto: lo unico que cambia es la forma de presentarlo, y
 * cuando una tabla se sustituye por una visualizacion, la visualizacion se
 * construye con las celdas de esa misma tabla.
 */

/** Tablas que se presentan de otra forma. La clave es `seccion::encabezados`. */
const TABLE_AS_VISUAL: Record<string, (rows: string[][]) => ReactNode> = {
  "las-lineas-de-servicio::División | Línea de servicio | Proyección Año 1 (MXN)": (rows) => (
    <CompanyCards rows={rows} />
  ),
  "la-inversion::Concepto | Valor": (rows) => <StatGrid stats={statsFrom(rows)} />,
  "8.2::Concepto | Valor": (rows) => <StatGrid stats={statsFrom(rows)} />,
  "8.3::Métrica | Valor": (rows) => <StatGrid stats={statsFrom(rows)} />,
  "6.2::Nivel | Puesto | Qué hace | Tiempo típico": (rows) => <ConsultingLadder rows={rows} />,
  "7.8::Órgano | Frecuencia | Duración | Participantes | Propósito": (rows) => (
    <CadenceCards rows={rows} />
  ),
  "7.9::Derecho | Detalle": (rows) => (
    <RightsCards rows={rows} icons={[Users, Scan, Handshake, HandCoins, ShieldCheck]} />
  ),
  "anexo-a::Año | Hito": (rows) => <HorizonTimeline rows={rows} />,
};

/** Una tabla de dos columnas se lee mejor como cifras grandes. */
function statsFrom(rows: string[][]): { value: string; label: string; note?: string }[] {
  return rows
    .filter((row) => (row[1] ?? "").trim() !== "")
    .map((row) => {
      const label = (row[0] ?? "").replace(/\*\*/g, "").trim();
      const raw = (row[1] ?? "").replace(/\*\*/g, "").trim();
      // "$200,000 USD ($3,600,000 MXN)" -> la cifra manda, el resto es nota.
      const split = /^([^(]+)\s*(\(.+\))?$/.exec(raw);
      return { value: (split?.[1] ?? raw).trim(), label, note: split?.[2] };
    });
}

/* --------------------------------------------------------------------------
 * Agrupado de parrafos etiquetados
 * ----------------------------------------------------------------------- */

/**
 * Los cinco niveles del embudo y los cinco fragmentos llegan como un parrafo
 * cada uno, abriendo con su etiqueta en negritas. Se agrupan para pintarlos
 * como una sola pieza en vez de cinco parrafos sueltos.
 */
const PARAGRAPH_GROUPS: {
  section: string;
  test: RegExp;
  render: (paragraphs: string[]) => ReactNode;
}[] = [
  {
    section: "6.1",
    test: /^\*\*NIVEL \d+:/,
    render: (paragraphs) => (
      <FunnelSteps
        paragraphs={paragraphs}
        icons={[GraduationCap, Scan, ClipboardList, Rocket, Share2]}
      />
    ),
  },
  {
    section: "6.1",
    test: /^\*\*FRAGMENTO [A-E]:/,
    render: (paragraphs) => <FragmentCards paragraphs={paragraphs} />,
  },
];

/* --------------------------------------------------------------------------
 * Piezas que se insertan en un punto concreto
 * ----------------------------------------------------------------------- */

/** Se inserta justo despues del bloque cuyo texto casa con `test`. */
const AFTER_BLOCK: { section: string; test: RegExp; node: ReactNode }[] = [
  // La rejilla del DX21 va despues de la explicacion, no antes.
  { section: "6.2", test: /^Diagnóstico diferencial:/, node: <Dx21Grid /> },
];

/** Se inserta al cerrar la seccion. */
const AFTER_SECTION: Record<string, ReactNode> = {
  "3.2": <AltCycle />,
};

/* --------------------------------------------------------------------------
 * Render
 * ----------------------------------------------------------------------- */

function renderBlocks(section: DocSection): ReactNode[] {
  const pieces: ReactNode[] = [];
  const blocks = section.blocks;
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index]!;

    if (block.kind === "paragraph") {
      const group = PARAGRAPH_GROUPS.find(
        (candidate) => candidate.section === section.key && candidate.test.test(block.text),
      );
      if (group) {
        const collected: string[] = [];
        while (index < blocks.length) {
          const candidate = blocks[index]!;
          if (candidate.kind !== "paragraph" || !group.test.test(candidate.text)) break;
          collected.push(candidate.text);
          index += 1;
        }
        pieces.push(<div key={`group-${index}`}>{group.render(collected)}</div>);
        continue;
      }
    }

    if (block.kind === "table") {
      const key = `${section.key}::${block.signature}`;

      const asVisual = TABLE_AS_VISUAL[key];
      if (asVisual) {
        pieces.push(<div key={index}>{asVisual(block.rows)}</div>);
        index += 1;
        continue;
      }

      const chart = TABLE_CHARTS[key];
      if (chart) {
        pieces.push(
          <div key={index}>
            <DocTable head={block.head} rows={block.rows} />
            <DocChart spec={chart.spec} caption={chart.caption} height={chart.height} />
          </div>,
        );
        index += 1;
        continue;
      }

      // La matematica del embudo lleva su propia figura, no una de Chart.js.
      if (key === "6.1::Etapa | Cantidad | Tasa de conversión | Fuente del dato") {
        pieces.push(
          <div key={index}>
            <DocTable head={block.head} rows={block.rows} />
            <FunnelChart stages={FUNNEL_STAGES} />
          </div>,
        );
        index += 1;
        continue;
      }
    }

    // El diagrama ASCII del flywheel se sustituye por el diagrama de verdad.
    if (block.kind === "code" && section.key === "4.1") {
      pieces.push(<Flywheel key={index} />);
      index += 1;
      continue;
    }

    pieces.push(<DocBlock key={index} block={block} />);

    const text = block.kind === "heading" || block.kind === "paragraph" ? block.text : null;
    if (text !== null) {
      const extra = AFTER_BLOCK.find(
        (rule) => rule.section === section.key && rule.test.test(text),
      );
      if (extra) pieces.push(<div key={`after-${index}`}>{extra.node}</div>);
    }

    index += 1;
  }

  const closing = AFTER_SECTION[section.key];
  if (closing) pieces.push(<div key="closing">{closing}</div>);

  return pieces;
}

/** El Anexo B: cinco titulos, cada uno con su tabla de terminos. */
function glossaryGroups(section: DocSection): GlossaryGroup[] {
  const groups: GlossaryGroup[] = [];
  for (const block of section.blocks) {
    if (block.kind === "heading") {
      groups.push({ category: block.text, terms: [] });
      continue;
    }
    if (block.kind === "table") {
      const current = groups[groups.length - 1];
      if (!current) continue;
      current.terms.push(
        ...block.rows.map((row) => ({
          term: (row[0] ?? "").trim(),
          definition: (row[1] ?? "").trim(),
        })),
      );
    }
  }
  return groups.filter((group) => group.terms.length > 0);
}

function SectionBody({ section }: { section: DocSection }) {
  if (section.key === "anexo-b") {
    return <Glossary groups={glossaryGroups(section)} />;
  }
  return <div className="space-y-5">{renderBlocks(section)}</div>;
}

/** Bloque 5 no tiene contenido todavia y el documento lo dice. Se muestra. */
function PendingChapter({ lead }: { lead: Block[] }) {
  const rest = lead.filter(
    (block) => !(block.kind === "paragraph" && block.text.includes("Sección pendiente")),
  );

  return (
    <Callout tone="warning" title="En desarrollo">
      <p className="text-ink font-semibold">Sección pendiente de desarrollo.</p>
      <DocBlocks blocks={rest} />
    </Callout>
  );
}

export function Chapter({ chapter }: { chapter: DocChapter }) {
  const Icon = chapter.number ? CHAPTER_ICONS[chapter.number] : undefined;
  const label = chapter.title.replace(/^Bloque\s+\d+\s*—\s*/, "");
  const pending = chapter.sections.length === 0 && chapter.lead.length > 0;

  return (
    <section
      id={chapter.id}
      className={`scroll-mt-20 ${chapter.number && chapter.number % 2 === 0 ? "surface-alt" : "surface-base"} bg-surface`}
    >
      <div className="mx-auto max-w-[62rem] px-5 py-16 md:px-10 md:py-24">
        <header className="border-line border-b pb-8">
          <div className="flex items-center gap-3">
            {Icon ? (
              <span className="text-accent-ink" aria-hidden>
                <Icon size={22} strokeWidth={1.75} />
              </span>
            ) : null}
            <p className="text-accent-ink font-mono text-xs tracking-[0.2em] uppercase">
              Bloque {chapter.number}
            </p>
          </div>
          <h2 className="font-display text-ink mt-4 text-3xl leading-[1.08] font-extrabold tracking-tight md:text-5xl">
            {label}
          </h2>
        </header>

        {pending ? (
          <PendingChapter lead={chapter.lead} />
        ) : (
          <>
            {chapter.lead.length > 0 ? (
              <div className="mt-10">
                <DocBlocks blocks={chapter.lead} />
              </div>
            ) : null}

            {chapter.sections.map((section) => (
              <article key={section.id} id={section.id} className="mt-16 scroll-mt-20">
                <h3 className="font-display text-ink border-line border-b pb-3 text-2xl font-bold tracking-tight md:text-3xl">
                  {section.title}
                </h3>
                <div className="mt-6">
                  <SectionBody section={section} />
                </div>
              </article>
            ))}
          </>
        )}
      </div>
    </section>
  );
}
