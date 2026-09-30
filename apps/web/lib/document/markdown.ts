/**
 * Parser de Markdown acotado al Documento Maestro.
 *
 * El texto del documento es el aprobado por el CEO y no se puede tocar: por eso
 * la pagina no transcribe el contenido a JSX, lo lee de `docs/DOCUMENTO-MAESTRO.md`
 * y lo convierte en bloques. Si alguien corrige una cifra en el MD, la web cambia
 * sola y nadie tiene que acordarse de replicarlo.
 *
 * No pretende ser CommonMark. Cubre exactamente lo que el documento usa:
 * titulos 1-3, parrafos, listas con y sin numero, tablas, reglas y dos bloques
 * de codigo. Lo que no esta aqui es porque el documento no lo contiene.
 */

export type Block =
  | { kind: "heading"; level: 1 | 2 | 3; text: string; id: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "table"; head: string[]; rows: string[][]; signature: string }
  | { kind: "code"; text: string }
  | { kind: "rule" };

/** Una seccion `##` dentro de un bloque. Es la unidad que navega el sidebar. */
export type DocSection = {
  /** Clave estable para enganchar visualizaciones: "2.1", "anexo-b", o el slug. */
  key: string;
  title: string;
  id: string;
  blocks: Block[];
};

/** Un capitulo: un titulo de primer nivel despues de la portada. */
export type DocChapter = {
  key: string;
  number: number | null;
  title: string;
  id: string;
  /** Lo que va entre el titulo del bloque y su primera seccion. */
  lead: Block[];
  sections: DocSection[];
};

export type ParsedDoc = {
  title: string;
  subtitle: string;
  cover: Block[];
  chapters: DocChapter[];
};

const SLUG_STRIP = /[^\p{Letter}\p{Number}]+/gu;

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\*\*/g, "")
    .toLowerCase()
    .replace(SLUG_STRIP, "-")
    .replace(/^-+|-+$/g, "");
}

/** Convierte `| a | b |` en ["a", "b"], respetando celdas vacias. */
function splitRow(line: string): string[] {
  return line
    .replace(/^\s*\|/, "")
    .replace(/\|\s*$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

const DIVIDER = /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/;

function isTableLine(line: string): boolean {
  return line.trimStart().startsWith("|");
}

/**
 * Firma de una tabla: los encabezados unidos.
 *
 * Es asi a proposito. Las visualizaciones se enganchan por firma y no por
 * posicion, de modo que reordenar el documento no cuelga una grafica de la
 * tabla equivocada — como mucho deja de mostrarse, que es el fallo seguro.
 */
function tableSignature(head: string[]): string {
  return head.map((cell) => cell.replace(/\*\*/g, "").trim()).join(" | ");
}

/** Convierte el cuerpo de una seccion en bloques. */
function parseBlocks(lines: string[], seenIds: Set<string>): Block[] {
  const blocks: Block[] = [];
  let i = 0;

  const uniqueId = (text: string): string => {
    const base = slugify(text) || "seccion";
    let id = base;
    let n = 2;
    while (seenIds.has(id)) id = `${base}-${n++}`;
    seenIds.add(id);
    return id;
  };

  while (i < lines.length) {
    const line = lines[i] ?? "";
    const trimmed = line.trim();

    if (!trimmed) {
      i += 1;
      continue;
    }

    if (trimmed === "---") {
      blocks.push({ kind: "rule" });
      i += 1;
      continue;
    }

    if (trimmed.startsWith("```")) {
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !(lines[i] ?? "").trim().startsWith("```")) {
        body.push(lines[i] ?? "");
        i += 1;
      }
      i += 1;
      blocks.push({ kind: "code", text: body.join("\n") });
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(trimmed);
    if (heading) {
      const level = heading[1]!.length as 1 | 2 | 3;
      const text = heading[2]!.trim();
      blocks.push({ kind: "heading", level, text, id: uniqueId(text) });
      i += 1;
      continue;
    }

    if (isTableLine(line)) {
      const head = splitRow(line);
      i += 1;
      // La linea de guiones es obligatoria en este documento; si falta, lo que
      // sigue no era una tabla.
      if (i < lines.length && DIVIDER.test(lines[i] ?? "")) {
        i += 1;
        const rows: string[][] = [];
        while (i < lines.length && isTableLine(lines[i] ?? "")) {
          rows.push(splitRow(lines[i] ?? ""));
          i += 1;
        }
        blocks.push({ kind: "table", head, rows, signature: tableSignature(head) });
        continue;
      }
      blocks.push({ kind: "paragraph", text: trimmed });
      continue;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(trimmed);
    const numbered = /^\d+\.\s+(.*)$/.exec(trimmed);
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      const items: string[] = [];
      while (i < lines.length) {
        const candidate = (lines[i] ?? "").trim();
        const next = ordered ? /^\d+\.\s+(.*)$/.exec(candidate) : /^[-*]\s+(.*)$/.exec(candidate);
        if (!next) break;
        items.push(next[1]!.trim());
        i += 1;
      }
      blocks.push({ kind: "list", ordered, items });
      continue;
    }

    // Parrafo: se junta con las lineas siguientes hasta el primer corte.
    const paragraph: string[] = [trimmed];
    i += 1;
    while (i < lines.length) {
      const candidate = (lines[i] ?? "").trim();
      if (
        !candidate ||
        candidate === "---" ||
        candidate.startsWith("#") ||
        candidate.startsWith("```") ||
        isTableLine(lines[i] ?? "") ||
        /^[-*]\s+/.test(candidate) ||
        /^\d+\.\s+/.test(candidate)
      ) {
        break;
      }
      paragraph.push(candidate);
      i += 1;
    }
    blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
  }

  return blocks;
}

/** "2.4 Priorizacion..." -> "2.4"; "Anexo B — Glosario" -> "anexo-b". */
function sectionKey(title: string): string {
  const numbered = /^(\d+\.\d+)\s/.exec(title);
  if (numbered) return numbered[1]!;
  const annex = /^Anexo\s+([A-Z])\b/.exec(title);
  if (annex) return `anexo-${annex[1]!.toLowerCase()}`;
  return slugify(title);
}

/**
 * "Bloque 3 — Modelo de Negocio" -> 3; "4. Economia del Negocio" -> 4.
 *
 * Los dos documentos numeran sus capitulos distinto. En vez de tener un parser
 * por documento, se reconocen las dos formas: es la misma idea escrita de dos
 * maneras.
 */
function chapterNumber(title: string): number | null {
  const match = /^(?:Bloque\s+)?(\d+)(?:\s*[.—-]|\s)/.exec(title.trim());
  return match ? Number(match[1]) : null;
}

/** Quita el numero del titulo: lo pinta el encabezado por su cuenta. */
export function chapterLabel(title: string): string {
  return title.replace(/^(?:Bloque\s+)?\d+\s*[.—-]?\s*/, "").trim();
}

/**
 * El documento entero como una tira de bloques, sin capitulos.
 *
 * Para textos cortos que no tienen estructura de documento largo — el convenio
 * de confidencialidad, por ejemplo. `parseDocument` trata el primer `#` como
 * portada y los siguientes como capitulos; un contrato de una pagina no encaja
 * en eso y acabaria con el cuerpo vacio.
 */
export function parseFlat(markdown: string): Block[] {
  return parseBlocks(markdown.replace(/\r\n/g, "\n").split("\n"), new Set<string>());
}

export function parseDocument(markdown: string): ParsedDoc {
  const seenIds = new Set<string>();
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");

  // La portada es el primer `#`; de ahi en adelante, cada `#` abre capitulo.
  // Antes se buscaba "# Bloque", que solo existe en el Documento Maestro.
  const headingOnes: number[] = [];
  lines.forEach((line, index) => {
    if (/^#\s+\S/.test(line.trim()) && !/^##/.test(line.trim())) headingOnes.push(index);
  });
  const chapterStarts = headingOnes.slice(1);

  const coverEnd = chapterStarts[0] ?? lines.length;
  const coverBlocks = parseBlocks(lines.slice(0, coverEnd), seenIds);

  const headings = coverBlocks.filter(
    (block): block is Extract<Block, { kind: "heading" }> => block.kind === "heading",
  );
  const title = headings.find((heading) => heading.level === 1)?.text ?? "ALTEC Group";
  const subtitle = headings.find((heading) => heading.level === 2)?.text ?? "";
  const cover = coverBlocks.filter((b) => b.kind !== "heading" && b.kind !== "rule");

  const chapters: DocChapter[] = chapterStarts.map((start, index) => {
    const end = chapterStarts[index + 1] ?? lines.length;
    const blocks = parseBlocks(lines.slice(start, end), seenIds);

    const head = blocks[0];
    const rawTitle = head?.kind === "heading" ? head.text : `Sección ${index + 1}`;
    const id = head?.kind === "heading" ? head.id : `seccion-${index + 1}`;
    const number = chapterNumber(rawTitle);

    const body = blocks.slice(1);
    const lead: Block[] = [];
    const sections: DocSection[] = [];

    for (const block of body) {
      if (block.kind === "rule") continue;
      if (block.kind === "heading" && block.level === 2) {
        sections.push({
          key: sectionKey(block.text),
          title: block.text,
          id: block.id,
          blocks: [],
        });
        continue;
      }
      const current = sections[sections.length - 1];
      if (current) current.blocks.push(block);
      else lead.push(block);
    }

    return {
      key: `cap-${number ?? index + 1}`,
      number: number ?? index + 1,
      title: rawTitle,
      id,
      lead,
      sections,
    };
  });

  return { title, subtitle, cover, chapters };
}
