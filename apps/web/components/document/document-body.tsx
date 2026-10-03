import type { ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  GitMerge,
  KeyRound,
  ListOrdered,
  Server,
  Workflow,
  CalendarRange,
  ClipboardList,
  GraduationCap,
  HandCoins,
  Handshake,
  Layers,
  LineChart,
  PieChart,
  Rocket,
  Scan,
  Share2,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { chapterLabel, type Block, type DocChapter, type DocSection } from "@/lib/document/markdown";
import { DocBlock, DocBlocks, DocTable } from "./prose";
import { DocChart } from "./chart";
import { Glossary, type GlossaryGroup } from "./glossary";
import { FUNNEL_STAGES, MEMO_TABLE_CHARTS, TABLE_CHARTS, type ChartEntry } from "./enhancements";
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

/**
 * Todo lo que un documento cambia respecto del renderizado plano.
 *
 * Va por documento y no en un solo mapa global porque el Documento Maestro y
 * el Memorandum tienen tablas con encabezados parecidos: "Concepto | Valor"
 * existe en los dos. Con un mapa compartido, una grafica de uno acabaria
 * colgada de la tabla del otro, con cifras que no son.
 */
export type DocRegistry = {
  charts: Record<string, ChartEntry>;
  visuals: Record<string, (rows: string[][]) => ReactNode>;
  /** Conserva la tabla y añade una figura hecha a mano debajo. */
  figures: Record<string, ReactNode>;
  paragraphGroups: { section: string; test: RegExp; render: (p: string[]) => ReactNode }[];
  afterBlock: { section: string; test: RegExp; node: ReactNode }[];
  afterSection: Record<string, ReactNode>;
  /** Bloques de codigo que se sustituyen por un diagrama, por clave de seccion. */
  codeAs: Record<string, ReactNode>;
  /** La seccion, o el capitulo entero, que es un glosario. */
  glossarySection?: string;
  glossaryChapter?: string;
};

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

/**
 * Pinta una tira de bloques aplicando lo que diga el registro.
 *
 * `key` es la clave de la seccion, o la del capitulo cuando el capitulo no
 * tiene subsecciones — en el Memorandum, cuatro capitulos llevan su tabla
 * directamente bajo el titulo, y sin esto se quedarian sin visualizacion.
 */
function renderBlocks(blocks: Block[], key: string, reg: DocRegistry): ReactNode[] {
  const pieces: ReactNode[] = [];
  let index = 0;

  while (index < blocks.length) {
    const block = blocks[index]!;

    if (block.kind === "paragraph") {
      const group = reg.paragraphGroups.find(
        (candidate) => candidate.section === key && candidate.test.test(block.text),
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
      const tableKey = `${key}::${block.signature}`;

      const asVisual = reg.visuals[tableKey];
      if (asVisual) {
        pieces.push(<div key={index}>{asVisual(block.rows)}</div>);
        index += 1;
        continue;
      }

      const chart = reg.charts[tableKey];
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

      // Figuras hechas a mano: conservan la tabla y añaden la suya debajo.
      const figure = reg.figures[tableKey];
      if (figure) {
        pieces.push(
          <div key={index}>
            <DocTable head={block.head} rows={block.rows} />
            {figure}
          </div>,
        );
        index += 1;
        continue;
      }
    }

    // Un bloque de codigo que en realidad es un diagrama.
    const asDiagram = block.kind === "code" ? reg.codeAs[key] : undefined;
    if (asDiagram) {
      pieces.push(<div key={index}>{asDiagram}</div>);
      index += 1;
      continue;
    }

    pieces.push(<DocBlock key={index} block={block} />);

    const text = block.kind === "heading" || block.kind === "paragraph" ? block.text : null;
    if (text !== null) {
      const extra = reg.afterBlock.find((rule) => rule.section === key && rule.test.test(text));
      if (extra) pieces.push(<div key={`after-${index}`}>{extra.node}</div>);
    }

    index += 1;
  }

  const closing = reg.afterSection[key];
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

/** El glosario del Memorandum: cada categoria es una seccion con su tabla. */
function chapterGlossary(chapter: DocChapter): GlossaryGroup[] {
  return chapter.sections
    .map((section) => ({
      category: section.title,
      terms: section.blocks
        .filter((b): b is Extract<Block, { kind: "table" }> => b.kind === "table")
        .flatMap((table) =>
          table.rows.map((row) => ({
            term: (row[0] ?? "").trim(),
            definition: (row[1] ?? "").trim(),
          })),
        ),
    }))
    .filter((group) => group.terms.length > 0);
}

function SectionBody({ section, reg }: { section: DocSection; reg: DocRegistry }) {
  if (section.key === reg.glossarySection) {
    return <Glossary groups={glossaryGroups(section)} />;
  }
  return <div className="space-y-5">{renderBlocks(section.blocks, section.key, reg)}</div>;
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

export function Chapter({
  chapter,
  reg,
  icons,
}: {
  chapter: DocChapter;
  reg: DocRegistry;
  icons?: Record<number, LucideIcon>;
}) {
  const Icon = chapter.number ? (icons ?? CHAPTER_ICONS)[chapter.number] : undefined;
  const label = chapterLabel(chapter.title);
  // Solo el Bloque 5 del Documento Maestro: declara que esta sin escribir.
  const pending =
    chapter.sections.length === 0 &&
    chapter.lead.some((b) => b.kind === "paragraph" && b.text.includes("Sección pendiente"));
  // Un capitulo sin subsecciones lleva sus tablas en el cuerpo: el registro se
  // aplica igual, usando la clave del capitulo.
  const isGlossary = chapter.key === reg.glossaryChapter;

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
              <div className="mt-10 space-y-5">
                {renderBlocks(chapter.lead, chapter.key, reg)}
              </div>
            ) : null}

            {isGlossary ? (
              <div className="mt-10">
                <Glossary groups={chapterGlossary(chapter)} />
              </div>
            ) : (
              chapter.sections.map((section) => (
                <article key={section.id} id={section.id} className="mt-16 scroll-mt-20">
                  <h3 className="font-display text-ink border-line border-b pb-3 text-2xl font-bold tracking-tight md:text-3xl">
                    {section.title}
                  </h3>
                  <div className="mt-6">
                    <SectionBody section={section} reg={reg} />
                  </div>
                </article>
              ))
            )}
          </>
        )}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------------
 * Los dos documentos
 * ----------------------------------------------------------------------- */

/** Documento Oficial del Holding. */
export const masterRegistry: DocRegistry = {
  charts: TABLE_CHARTS,
  visuals: TABLE_AS_VISUAL,
  figures: {
    "6.1::Etapa | Cantidad | Tasa de conversión | Fuente del dato": (
      <FunnelChart stages={FUNNEL_STAGES} />
    ),
  },
  paragraphGroups: PARAGRAPH_GROUPS,
  afterBlock: AFTER_BLOCK,
  afterSection: AFTER_SECTION,
  // El diagrama ASCII del flywheel, dibujado de verdad.
  codeAs: { "4.1": <Flywheel /> },
  glossarySection: "anexo-b",
};

/** Memorandum de Inversion. */
export const memorandumRegistry: DocRegistry = {
  charts: MEMO_TABLE_CHARTS,
  visuals: {
    "cap-1::Concepto | Valor": (rows) => <StatGrid stats={statsFrom(rows)} />,
    "7.2::Derecho | Descripción": (rows) => (
      <RightsCards
        rows={rows}
        icons={[Users, Handshake, Share2, Scan, ShieldCheck, ClipboardList, HandCoins]}
      />
    ),
    "cap-9::Fecha | Hito": (rows) => <HorizonTimeline rows={rows} />,
  },
  figures: {},
  paragraphGroups: [],
  afterBlock: [],
  afterSection: {},
  // Las formulas de MOIC y TIR van como codigo: es lo que son.
  codeAs: {},
  glossaryChapter: "cap-11",
};

/**
 * Arquitectura de ALTEC VO.
 *
 * Sin visualizaciones propias: sus tablas son comparativas y decisiones, no
 * cifras. Una grafica ahi no añadiria nada — diria lo mismo con menos
 * precision.
 */
export const architectureRegistry: DocRegistry = {
  charts: {},
  visuals: {},
  figures: {},
  paragraphGroups: [],
  afterBlock: [],
  afterSection: {},
  codeAs: {},
};

/** Iconos de los capitulos de Arquitectura. */
export const ARCH_ICONS: Record<number, LucideIcon> = {
  1: GitMerge,
  2: Server,
  3: Workflow,
  4: Users,
  5: KeyRound,
  6: ClipboardList,
  7: Layers,
  8: ShieldCheck,
  9: PieChart,
  10: ListOrdered,
};

/** Iconos de los capitulos del Memorandum. */
export const MEMO_ICONS: Record<number, LucideIcon> = {
  1: Target,
  2: Layers,
  3: TrendingUp,
  4: BarChart3,
  5: LineChart,
  6: PieChart,
  7: ShieldCheck,
  8: Users,
  9: CalendarRange,
  10: Scan,
  11: BookOpen,
};
