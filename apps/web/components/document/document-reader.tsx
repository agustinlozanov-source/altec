import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";
import { AltecLogo } from "@altec/ui";
import type { ParsedDoc } from "@/lib/document/markdown";
import { chapterLabel } from "@/lib/document/markdown";
import { Chapter, type DocRegistry } from "./document-body";
import { DocShell, type OutlineChapter } from "./doc-shell";
import { Inline } from "./inline";

/**
 * El lector, compartido por los dos documentos.
 *
 * Lo unico que los distingue es el contenido y su registro de
 * visualizaciones. La portada, el indice, el armazon y el pie son los mismos:
 * un inversionista que pasa del Memorandum al Documento Maestro no deberia
 * notar que cambio de sitio.
 */
export function DocumentReader({
  doc,
  registry,
  icons,
  email,
  note,
}: {
  doc: ParsedDoc;
  registry: DocRegistry;
  icons?: Record<number, LucideIcon>;
  email: string;
  /** Aviso legal al pie, si el documento lo lleva. */
  note?: string;
}) {
  const outline: OutlineChapter[] = doc.chapters.map((chapter) => ({
    id: chapter.id,
    number: chapter.number,
    label: chapterLabel(chapter.title),
    sections: chapter.sections.map((section) => ({
      id: section.id,
      title: section.title.replace(/^\d+\.\d+\s+/, ""),
    })),
  }));

  const [altLine, dateLine, ...notes] = doc.cover.filter((block) => block.kind === "paragraph");

  return (
    <DocShell outline={outline} title={doc.subtitle} email={email}>
      <section className="surface-invert bg-surface">
        <div className="mx-auto max-w-[62rem] px-5 py-20 md:px-10 md:py-28">
          <AltecLogo className="h-9 w-auto md:h-11" priority />

          <h1 className="font-display text-ink mt-12 text-4xl leading-[1.02] font-extrabold tracking-tight md:text-6xl">
            {doc.title}
          </h1>
          <p className="font-display text-muted mt-3 text-2xl font-semibold md:text-3xl">
            {doc.subtitle}
          </p>

          {altLine?.kind === "paragraph" ? (
            <p className="text-accent-ink mt-8 font-mono text-xs tracking-[0.22em] uppercase">
              {altLine.text.replace(/\*\*/g, "")}
            </p>
          ) : null}

          <div className="border-line mt-12 flex flex-wrap items-center gap-x-4 gap-y-3 border-t pt-8">
            {dateLine?.kind === "paragraph" ? (
              <p className="text-muted font-mono text-sm">{dateLine.text}</p>
            ) : null}
            <span className="border-attention/50 text-attention rounded-full border px-3 py-1 font-mono text-[0.65rem] tracking-[0.12em] uppercase">
              Distribución restringida
            </span>
          </div>

          {notes.map((block, index) =>
            block.kind === "paragraph" ? (
              <p key={index} className="text-muted mt-6 max-w-2xl text-sm leading-relaxed">
                <Inline text={block.text} />
              </p>
            ) : null,
          )}

          {/* Quien lo esta leyendo, escrito en la propia portada. Un documento
              que sabe quien lo abrio invita a tratarlo como lo que es. */}
          <p className="text-muted mt-10 font-mono text-xs">
            Consultado por {email} · este acceso queda registrado
          </p>
        </div>
      </section>

      {doc.chapters.map((chapter) => (
        <Chapter key={chapter.id} chapter={chapter} reg={registry} icons={icons} />
      ))}

      <footer className="surface-invert bg-surface">
        <div className="mx-auto max-w-[62rem] px-5 py-10 md:px-10">
          {note ? (
            <p className="text-muted border-line mx-auto max-w-3xl border-b pb-8 text-center text-xs leading-relaxed">
              {note}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-muted font-mono text-xs">
              ALTEC Group SAPI de CV · Documento confidencial
            </p>
            <Link
              href="/"
              className="text-muted hover:text-accent-ink inline-flex items-center gap-2 text-sm"
            >
              <ArrowLeft size={15} />
              Volver al sitio
            </Link>
          </div>
        </div>
      </footer>
    </DocShell>
  );
}
