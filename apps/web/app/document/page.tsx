import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AltecLogo } from "@altec/ui";
import { DocumentAccessForm } from "@/components/document/access-form";
import { Chapter } from "@/components/document/document-body";
import { DocShell, type OutlineChapter } from "@/components/document/doc-shell";
import { Inline } from "@/components/document/inline";
import { hasAccess, isConfigured } from "@/lib/document/access";
import { loadDocument } from "@/lib/document/source";

export const metadata: Metadata = {
  title: "Documento Oficial del Holding",
  description: "Documento oficial del holding ALTEC Group SAPI de CV.",
  // Confidencial: no se indexa ni se sigue.
  robots: { index: false, follow: false, nocache: true },
};

/** El acceso se evalua en cada visita. */
export const dynamic = "force-dynamic";

export default async function DocumentPage() {
  const configured = isConfigured();
  const allowed = configured && (await hasAccess());

  if (!allowed) {
    return <DocumentAccessForm configured={configured} />;
  }

  const doc = await loadDocument();

  const outline: OutlineChapter[] = doc.chapters.map((chapter) => ({
    id: chapter.id,
    number: chapter.number,
    label: chapter.title.replace(/^Bloque\s+\d+\s*—\s*/, ""),
    sections: chapter.sections.map((section) => ({
      id: section.id,
      title: section.title.replace(/^\d+\.\d+\s+/, ""),
    })),
  }));

  const [altLine, dateLine, ...notes] = doc.cover.filter((block) => block.kind === "paragraph");

  return (
    <DocShell outline={outline} title="ALTEC Group">
      <section className="surface-invert bg-surface">
        <div className="mx-auto max-w-[62rem] px-5 py-20 md:px-10 md:py-28">
          <AltecLogo className="h-9 w-auto md:h-11" priority />

          <h1 className="font-display text-ink mt-12 text-4xl leading-[1.02] font-extrabold tracking-tight md:text-6xl">
            {doc.title}
          </h1>
          <p className="font-display text-muted mt-3 text-2xl font-semibold md:text-3xl">
            {doc.subtitle}
          </p>

          {altLine ? (
            <p className="text-accent-ink mt-8 font-mono text-xs tracking-[0.22em] uppercase">
              {altLine.kind === "paragraph" ? altLine.text.replace(/\*\*/g, "") : null}
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

          {notes.map((note, index) =>
            note.kind === "paragraph" ? (
              <p key={index} className="text-muted mt-6 max-w-2xl text-sm leading-relaxed">
                <Inline text={note.text} />
              </p>
            ) : null,
          )}
        </div>
      </section>

      {doc.chapters.map((chapter) => (
        <Chapter key={chapter.id} chapter={chapter} />
      ))}

      <footer className="doc-hide-print surface-invert bg-surface">
        <div className="mx-auto flex max-w-[62rem] flex-wrap items-center justify-between gap-4 px-5 py-10 md:px-10">
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
      </footer>
    </DocShell>
  );
}
