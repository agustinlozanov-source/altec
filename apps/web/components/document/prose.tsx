import { Check } from "lucide-react";
import type { Block } from "@/lib/document/markdown";
import { Inline } from "./inline";

/**
 * Los bloques del documento, con su tipografia.
 *
 * `--color-read` para el texto corrido y `--color-ink` para titulos y cifras:
 * la jerarquia se hace con peso y tamaño, no bajando el contraste.
 */

const NUMERIC = /^[*\s]*[~$+±]?\s*[\d.,]+\s*(%|x|M|K|B|USD|MXN|\/10)?\b|^[*\s]*[$~]/i;

/**
 * Una columna se alinea a la derecha si la mayoria de sus celdas son cifras.
 *
 * Con el tope de longitud: hay columnas que empiezan por un numero pero siguen
 * con una frase ("18% (puede llegar a 20-21%)"). Alineadas a la derecha y en
 * monoespaciada se parten en tres lineas y se leen peor que a la izquierda.
 */
function numericColumns(head: string[], rows: string[][]): boolean[] {
  return head.map((_, column) => {
    const cells = rows
      .map((row) => (row[column] ?? "").replace(/\*\*/g, "").trim())
      .filter((cell) => cell !== "" && cell !== "—" && cell !== "-");
    if (cells.length === 0) return false;
    if (cells.some((cell) => cell.length > 16)) return false;
    const hits = cells.filter((cell) => NUMERIC.test(cell)).length;
    return hits / cells.length > 0.6;
  });
}

/** El documento marca los totales poniendo la primera celda en negritas. */
function isTotalRow(row: string[]): boolean {
  const first = (row[0] ?? "").trim();
  return first.startsWith("**") && first.endsWith("**");
}

export function DocTable({ head, rows }: { head: string[]; rows: string[][] }) {
  const alignRight = numericColumns(head, rows);

  return (
    <div className="border-line bg-card/40 doc-scroll my-8 overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-card border-line border-b">
            {head.map((cell, index) => (
              <th
                key={`${index}-${cell}`}
                scope="col"
                className={`text-ink px-4 py-3 font-mono text-[0.7rem] font-semibold tracking-[0.08em] uppercase ${
                  alignRight[index] ? "text-right" : ""
                }`}
              >
                <Inline text={cell} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => {
            const total = isTotalRow(row);
            return (
              <tr
                key={rowIndex}
                className={
                  total
                    ? "border-line-strong bg-accent-ink/8 text-ink border-t-2"
                    : // `--color-line` ya es una capa translucida que se invierte con el modo:
                      // sirve de zebra sin tener que escribir un color por modo.
                      "border-line/60 text-read border-t even:bg-line/40"
                }
              >
                {row.map((cell, cellIndex) => {
                  const trimmed = cell.trim();
                  return (
                    <td
                      key={cellIndex}
                      className={`px-4 py-3 align-top leading-relaxed ${
                        alignRight[cellIndex] ? "text-right font-mono tabular-nums" : ""
                      } ${cellIndex === 0 ? "text-ink font-medium" : ""}`}
                    >
                      {trimmed === "✓" ? (
                        <span className="text-accent-ink inline-flex">
                          <Check size={16} strokeWidth={3} aria-label="Sí" />
                        </span>
                      ) : (
                        <Inline text={cell} />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function DocBlock({ block }: { block: Block }) {
  switch (block.kind) {
    case "heading": {
      if (block.level === 3) {
        return (
          <h3
            id={block.id}
            className="font-display text-ink scroll-mt-28 pt-6 text-xl font-bold tracking-tight md:text-2xl"
          >
            <Inline text={block.text} />
          </h3>
        );
      }
      return (
        <h4 id={block.id} className="font-display text-ink scroll-mt-28 pt-4 text-lg font-semibold">
          <Inline text={block.text} />
        </h4>
      );
    }

    case "paragraph":
      return (
        <p className="text-read text-[1.0625rem] leading-[1.75]">
          <Inline text={block.text} />
        </p>
      );

    case "list":
      return block.ordered ? (
        <ol className="text-read marker:text-accent-ink space-y-2.5 pl-6 text-[1.0625rem] leading-[1.7] marker:font-mono marker:text-sm">
          {block.items.map((item, index) => (
            <li key={index} className="pl-1.5">
              <Inline text={item} />
            </li>
          ))}
        </ol>
      ) : (
        <ul className="text-read space-y-2.5 text-[1.0625rem] leading-[1.7]">
          {block.items.map((item, index) => (
            <li key={index} className="relative pl-6">
              <span
                aria-hidden
                className="bg-accent-ink absolute top-[0.7em] left-0 h-1.5 w-1.5 rounded-full"
              />
              <Inline text={item} />
            </li>
          ))}
        </ul>
      );

    case "table":
      return <DocTable head={block.head} rows={block.rows} />;

    case "code":
      return (
        <pre className="border-line bg-card doc-scroll text-muted my-8 overflow-x-auto rounded-xl border p-5 font-mono text-xs leading-relaxed">
          {block.text}
        </pre>
      );

    case "rule":
      return <hr className="border-line my-10" />;
  }
}

/** Una tira de bloques, con el espaciado vertical ya resuelto. */
export function DocBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((block, index) => (
        <DocBlock key={index} block={block} />
      ))}
    </div>
  );
}
