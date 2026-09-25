"use client";

import dynamic from "next/dynamic";
import { useMemo, useRef, useState } from "react";
import { roster, human } from "@altec/agents";
import {
  cameraViews,
  createOfficePeople,
  sceneThemes,
  type CameraViewId,
  type Person,
  type SceneThemeId,
} from "@altec/office3d";
import { cn } from "@altec/ui";

/** El canvas solo existe en el navegador: WebGL no se renderiza en el servidor. */
const OfficeCanvas = dynamic(
  () => import("@altec/office3d").then((m) => ({ default: m.OfficeCanvas })),
  {
    ssr: false,
    loading: () => (
      <div className="text-altec-cream/50 flex h-full items-center justify-center font-mono text-xs">
        Levantando la oficina…
      </div>
    ),
  },
);

const stateLabels: Record<Person["state"], string> = {
  working: "Trabajando",
  meeting: "En reunión",
  collab: "Colaborando",
  awaiting: "Espera tu decisión",
  idle: "En pausa",
};

const stateDots: Record<Person["state"], string> = {
  working: "bg-vo-working",
  meeting: "bg-vo-meeting",
  collab: "bg-vo-collab",
  awaiting: "bg-vo-awaiting",
  idle: "bg-vo-idle",
};

export function OfficeViewer() {
  const [view, setView] = useState<CameraViewId>("general");
  const [themeId, setThemeId] = useState<SceneThemeId>("studio");
  const overlay = useRef<HTMLDivElement>(null);

  // Las personas son objetos mutables que la escena mueve cuadro a cuadro.
  // Se crean una sola vez: volver a crearlas reiniciaria la oficina.
  const people = useMemo(() => createOfficePeople(), []);
  const byId = useMemo(() => new Map(people.map((p) => [p.id, p])), [people]);
  const [selected, setSelected] = useState<string | null>(null);

  const agent = selected ? roster.find((a) => a.key === selected) : null;

  return (
    <div className="border-altec-cream/10 rounded-card overflow-hidden border">
      <div className="grid lg:grid-cols-[1fr_320px]">
        <div className="relative h-[420px] md:h-[560px] lg:h-[620px]">
          <OfficeCanvas
            people={people}
            view={view}
            overlay={overlay}
            theme={sceneThemes[themeId]}
            selectedAgent={selected}
            onSelectAgent={setSelected}
          />

          {/* Capa donde se proyectan nombres, globos y avisos de espera. */}
          <div ref={overlay} className="pointer-events-none absolute inset-0 overflow-hidden" />

          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {cameraViews.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                aria-pressed={view === v.id}
                className={cn(
                  "rounded-pill border px-3 py-1.5 font-mono text-[10px] tracking-wide uppercase transition-colors",
                  view === v.id
                    ? "border-altec-green bg-altec-green text-altec-black"
                    : "border-altec-cream/20 text-altec-cream/70 hover:border-altec-cream/50 bg-altec-black/60 backdrop-blur",
                )}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* La apariencia de la oficina es configurable: el dashboard va con la
              identidad de ALTEC, la escena puede vestirse como se quiera. */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            {(Object.keys(sceneThemes) as SceneThemeId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setThemeId(id)}
                aria-pressed={themeId === id}
                className={cn(
                  "rounded-pill border px-3 py-1.5 font-mono text-[10px] tracking-wide uppercase transition-colors",
                  themeId === id
                    ? "border-altec-cream/60 text-altec-cream bg-altec-black/70 backdrop-blur"
                    : "border-altec-cream/15 text-altec-cream/45 hover:border-altec-cream/40 bg-altec-black/50 backdrop-blur",
                )}
              >
                {id === "studio" ? "Original" : "ALTEC"}
              </button>
            ))}
          </div>

          <p className="text-altec-cream/40 absolute right-3 bottom-3 font-mono text-[10px]">
            arrastra para girar · rueda para acercar
          </p>
        </div>

        <aside className="border-altec-cream/10 bg-altec-dark-gray flex max-h-[620px] flex-col border-t lg:border-t-0 lg:border-l">
          <div className="border-altec-cream/10 border-b px-5 py-4">
            <h2 className="text-altec-cream text-xs tracking-[0.18em] uppercase">Equipo</h2>
            <p className="text-altec-cream/55 mt-1 text-xs">
              {roster.length} agentes · {human.shortName} es el 20% humano
            </p>
          </div>

          {agent ? (
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-altec-cream/55 hover:text-altec-cream font-mono text-[10px] tracking-wide uppercase"
              >
                ← Volver al equipo
              </button>

              <h3 className="font-display text-altec-cream mt-4 text-lg font-extrabold italic">
                {agent.displayName}
              </h3>
              <p className="text-altec-green font-mono text-[11px]">{agent.role}</p>

              <p className="text-altec-cream/65 mt-4 text-xs leading-relaxed">{agent.persona}</p>

              <h4 className="text-altec-cream/90 mt-5 text-[10px] tracking-[0.18em] uppercase">
                Skills
              </h4>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {agent.skills.map((skill) => (
                  <li
                    key={skill}
                    className="border-altec-cream/15 text-altec-cream/70 rounded-pill border px-2.5 py-1 text-[10px]"
                  >
                    {skill}
                  </li>
                ))}
              </ul>

              <h4 className="text-altec-cream/90 mt-5 text-[10px] tracking-[0.18em] uppercase">
                Contexto cargado
              </h4>
              <ul className="text-altec-cream/60 mt-2 flex flex-col gap-1 text-[11px]">
                {agent.context.map((item) => (
                  <li key={item}>· {item}</li>
                ))}
              </ul>
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto">
              {roster.map((a) => {
                const state = byId.get(a.key)?.state ?? "idle";
                return (
                  <li key={a.key}>
                    <button
                      type="button"
                      onClick={() => setSelected(a.key)}
                      className="hover:bg-altec-cream/5 border-altec-cream/5 flex w-full items-start gap-3 border-b px-5 py-3 text-left"
                    >
                      <span
                        aria-hidden="true"
                        className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", stateDots[state])}
                      />
                      <span className="min-w-0">
                        <span className="text-altec-cream block text-sm">{a.displayName}</span>
                        <span className="text-altec-cream/50 block text-[11px]">{a.role}</span>
                        <span className="text-altec-cream/40 mt-0.5 block truncate text-[11px]">
                          {stateLabels[state]} · {a.routine[0]}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </div>
    </div>
  );
}
