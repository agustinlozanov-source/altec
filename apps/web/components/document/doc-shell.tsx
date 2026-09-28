"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUp, ChevronRight, LogOut, Menu, X } from "lucide-react";
import { AltecLogo } from "@altec/ui";
import { DocThemeToggle } from "./doc-theme-toggle";

/**
 * El armazon de lectura: barra lateral, cabecera fija y progreso.
 *
 * El indice se calcula en el servidor a partir del propio documento, asi que
 * no hay una lista de secciones escrita a mano que se pueda quedar vieja.
 *
 * El resaltado no usa IntersectionObserver: con secciones que miden pantallas
 * enteras, varias estan visibles a la vez y el observador no sabe cual es "la
 * actual". Mirar cual es el ultimo encabezado que ya paso por arriba da la
 * respuesta que espera quien lee.
 */

export type OutlineSection = { id: string; title: string };
export type OutlineChapter = {
  id: string;
  number: number | null;
  label: string;
  sections: OutlineSection[];
};

/** Altura de la cabecera fija: lo que hay que descontar al medir. */
const HEADER_OFFSET = 96;

export function DocShell({
  outline,
  title,
  email,
  children,
}: {
  outline: OutlineChapter[];
  title: string;
  /** Quien lo esta leyendo. Va en la cabecera y permite cerrar sesion. */
  email: string;
  children: React.ReactNode;
}) {
  const [activeId, setActiveId] = useState<string>(outline[0]?.id ?? "");
  const [progress, setProgress] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Que bloque esta abierto es estado derivado del scroll, asi que se calcula
  // en el render. Lo unico que guarda React es la excepcion: el bloque que
  // quien lee abrio o cerro a mano con la flecha.
  const [override, setOverride] = useState<{ chapter: string; open: boolean } | null>(null);
  const ticking = useRef(false);

  const measure = useCallback(() => {
    const ids = outline.flatMap((chapter) => [
      chapter.id,
      ...chapter.sections.map((section) => section.id),
    ]);

    let current = ids[0] ?? "";
    for (const id of ids) {
      const node = document.getElementById(id);
      if (!node) continue;
      if (node.getBoundingClientRect().top - HEADER_OFFSET <= 0) current = id;
    }
    setActiveId(current);

    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    setProgress(scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0);
  }, [outline]);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        measure();
        ticking.current = false;
      });
    };

    // La primera medicion va en el siguiente fotograma, cuando el navegador ya
    // resolvio el layout: medir en el cuerpo del efecto da alturas de antes de
    // que carguen las fuentes.
    const first = requestAnimationFrame(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(first);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [measure]);

  /**
   * Quita de la barra de direcciones los restos del enlace de acceso.
   *
   * El adaptador de Netlify reaña la query original a sus redirects, asi que
   * despues de entrar la URL queda como `/document?token_hash=...`. El token ya
   * esta gastado, pero este documento se comparte en pantalla y no hay motivo
   * para que eso salga en una reunion ni se quede en el historial.
   */
  useEffect(() => {
    const url = new URL(window.location.href);
    const junk = ["token_hash", "type", "next", "code", "estado"];
    if (!junk.some((key) => url.searchParams.has(key))) return;

    for (const key of junk) url.searchParams.delete(key);
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }, []);

  // En movil, el cajon se cierra al ir a una seccion y con Escape.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  // El bloque al que pertenece lo que se esta leyendo. Se abre solo.
  const activeChapter =
    outline.find(
      (chapter) =>
        chapter.id === activeId || chapter.sections.some((section) => section.id === activeId),
    )?.id ?? "";

  const isOpen = (id: string) => (override?.chapter === id ? override.open : id === activeChapter);

  const nav = (
    <DocNav
      outline={outline}
      activeId={activeId}
      isOpen={isOpen}
      onToggle={(id) => setOverride({ chapter: id, open: !isOpen(id) })}
      onNavigate={() => setDrawerOpen(false)}
      progress={progress}
    />
  );

  return (
    <div className="surface-base bg-surface min-h-screen">
      <header className="surface-invert fixed top-0 right-0 left-0 z-50 border-b border-white/10 bg-black/92 backdrop-blur-md">
        <div className="flex h-16 items-center gap-3 px-4 md:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="text-ink hover:text-accent-ink -ml-1 p-2 lg:hidden"
            aria-label="Abrir el índice"
          >
            <Menu size={20} />
          </button>

          <Link href="/" className="hidden shrink-0 lg:block" aria-label="Ir al sitio de ALTEC">
            <AltecLogo className="h-6 w-auto" />
          </Link>

          <p className="text-ink truncate text-sm font-semibold lg:ml-4">
            <span className="hidden md:inline">{title} — </span>
            Documento Oficial del Holding
          </p>

          <span className="border-attention/50 text-attention ml-auto shrink-0 rounded-full border px-2.5 py-1 font-mono text-[0.65rem] tracking-[0.1em] uppercase">
            Confidencial
          </span>

          <DocThemeToggle />

          {/* Formulario y no enlace: cerrar sesion cambia estado, y un GET lo
              dispara cualquier cosa que precargue enlaces. */}
          <form action="/auth/sign-out" method="post" className="shrink-0">
            <button
              type="submit"
              className="text-muted hover:text-ink p-2"
              aria-label={`Cerrar la sesión de ${email}`}
              title={`${email} · cerrar sesión`}
            >
              <LogOut size={18} />
            </button>
          </form>
        </div>

        {/* Progreso de lectura: la misma cifra que el sidebar, en una linea. */}
        <div className="h-0.5 w-full bg-white/10" aria-hidden>
          <div
            className="bg-accent-ink h-full transition-[width] duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </header>

      <div className="flex pt-16">
        <aside className="border-line bg-surface sticky top-16 hidden h-[calc(100vh-4rem)] w-[17rem] shrink-0 border-r lg:block">
          {nav}
        </aside>

        {drawerOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-black/60"
              onClick={() => setDrawerOpen(false)}
              aria-label="Cerrar el índice"
            />
            <div className="surface-base bg-surface border-line absolute top-0 bottom-0 left-0 flex w-[85%] max-w-[20rem] flex-col border-r">
              <div className="border-line flex h-16 shrink-0 items-center justify-between border-b px-4">
                <span className="text-ink font-mono text-xs tracking-[0.15em] uppercase">
                  Índice
                </span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="text-muted hover:text-ink p-2"
                  aria-label="Cerrar el índice"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="min-h-0 flex-1">{nav}</div>
            </div>
          </div>
        ) : null}

        <main id="documento" className="min-w-0 flex-1">
          {children}
        </main>
      </div>

      {progress > 0.04 ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="border-line bg-card text-ink hover:border-accent-ink fixed right-5 bottom-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border shadow-lg backdrop-blur"
          aria-label="Volver al inicio del documento"
        >
          <ArrowUp size={18} />
        </button>
      ) : null}
    </div>
  );
}

function DocNav({
  outline,
  activeId,
  isOpen: isChapterOpen,
  onToggle,
  onNavigate,
  progress,
}: {
  outline: OutlineChapter[];
  activeId: string;
  isOpen: (id: string) => boolean;
  onToggle: (id: string) => void;
  onNavigate: () => void;
  progress: number;
}) {
  return (
    <div className="flex h-full flex-col">
      <nav className="doc-scroll min-h-0 flex-1 overflow-y-auto px-3 py-5" aria-label="Índice del documento">
        <ul className="space-y-0.5">
          {outline.map((chapter) => {
            const isOpen = isChapterOpen(chapter.id);
            const isActive =
              chapter.id === activeId || chapter.sections.some((s) => s.id === activeId);

            return (
              <li key={chapter.id}>
                <div className="flex items-stretch">
                  <a
                    href={`#${chapter.id}`}
                    onClick={onNavigate}
                    className={`flex-1 rounded-md px-2.5 py-2 text-sm leading-snug transition-colors ${
                      isActive
                        ? "text-ink font-semibold"
                        : "text-muted hover:text-ink hover:bg-line/50"
                    }`}
                  >
                    <span className="text-accent-ink mr-2 font-mono text-xs">
                      {String(chapter.number ?? 0).padStart(2, "0")}
                    </span>
                    {chapter.label}
                  </a>
                  {chapter.sections.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => onToggle(chapter.id)}
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? "Contraer" : "Expandir"} ${chapter.label}`}
                      className="text-muted hover:text-ink shrink-0 px-2"
                    >
                      <ChevronRight
                        size={14}
                        className={`transition-transform ${isOpen ? "rotate-90" : ""}`}
                      />
                    </button>
                  ) : null}
                </div>

                {isOpen && chapter.sections.length > 0 ? (
                  <ul className="border-line mt-1 mb-2 ml-4 space-y-0.5 border-l pl-2">
                    {chapter.sections.map((section) => (
                      <li key={section.id}>
                        <a
                          href={`#${section.id}`}
                          onClick={onNavigate}
                          aria-current={section.id === activeId ? "location" : undefined}
                          className={`block rounded-md px-2.5 py-1.5 text-[0.8rem] leading-snug transition-colors ${
                            section.id === activeId
                              ? "bg-accent-ink/12 text-accent-ink font-medium"
                              : "text-muted hover:text-ink hover:bg-line/50"
                          }`}
                        >
                          {section.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-line shrink-0 border-t px-5 py-4">
        <div className="text-muted flex items-center justify-between font-mono text-[0.7rem]">
          <span>Progreso</span>
          <span className="text-ink tabular-nums">{Math.round(progress * 100)}%</span>
        </div>
        <div className="bg-line mt-2 h-1 w-full overflow-hidden rounded-full" aria-hidden>
          <div
            className="bg-accent-ink h-full transition-[width] duration-150"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
