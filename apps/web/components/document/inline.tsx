import { Fragment, type ReactNode } from "react";

/**
 * Marcado en linea del Documento Maestro: negritas, cursivas y URLs sueltas.
 *
 * El documento no usa enlaces con corchetes, solo URLs desnudas dentro de las
 * tablas del Anexo E, asi que se detectan y se vuelven enlaces aqui.
 */

const TOKEN = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|https?:\/\/[^\s|)]+)/g;

export function Inline({ text }: { text: string }): ReactNode {
  const parts = text.split(TOKEN).filter((part) => part !== "");

  return (
    <>
      {parts.map((part, index) => {
        const key = `${index}-${part.slice(0, 12)}`;

        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={key} className="text-ink font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }

        if (part.startsWith("*") && part.endsWith("*")) {
          return <em key={key}>{part.slice(1, -1)}</em>;
        }

        if (/^https?:\/\//.test(part)) {
          return (
            <a
              key={key}
              href={part}
              target="_blank"
              rel="noreferrer noopener"
              className="text-accent-ink decoration-accent-ink/40 hover:decoration-accent-ink break-all underline underline-offset-2"
            >
              {part.replace(/^https?:\/\//, "").replace(/\/$/, "")}
            </a>
          );
        }

        return <Fragment key={key}>{part}</Fragment>;
      })}
    </>
  );
}
