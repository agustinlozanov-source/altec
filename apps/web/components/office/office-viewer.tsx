"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { roster } from "@altec/agents";
import {
  cameraViews,
  createOfficePeople,
  DayScript,
  sceneThemes,
  Simulation,
  stateLabels,
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

const stateDots: Record<Person["state"], string> = {
  working: "bg-vo-working",
  meeting: "bg-vo-meeting",
  collab: "bg-vo-collab",
  awaiting: "bg-vo-awaiting",
  idle: "bg-vo-idle",
};

const legend = [
  { state: "working", label: stateLabels.working },
  { state: "meeting", label: stateLabels.meeting },
  { state: "collab", label: stateLabels.collab },
  { state: "awaiting", label: stateLabels.awaiting },
  { state: "idle", label: stateLabels.idle },
] as const;

type Tab = "team" | "inbox" | "feed";

export function OfficeViewer() {
  const [view, setView] = useState<CameraViewId>("general");
  const [themeId, setThemeId] = useState<SceneThemeId>("studio");
  const [tab, setTab] = useState<Tab>("team");
  const [selected, setSelected] = useState<string | null>(null);
  const [autoCam, setAutoCam] = useState(true);
  const [, forceClock] = useState(0);
  const overlay = useRef<HTMLDivElement>(null);

  // La oficina se crea una sola vez: recrearla reiniciaria la jornada.
  const { sim, script } = useMemo(() => {
    const simulation = new Simulation(createOfficePeople());
    const day = new DayScript(simulation);
    return { sim: simulation, script: day };
  }, []);

  useEffect(() => {
    void script.run();
    return () => script.stop();
  }, [script]);

  // El reloj avanza continuo; se refresca aparte para no renderizar por cuadro.
  useEffect(() => {
    const id = setInterval(() => forceClock((n) => n + 1), 250);
    return () => clearInterval(id);
  }, []);

  useSyncExternalStore(sim.subscribe, sim.getVersion, () => 0);

  const agents = sim.people.filter((p) => p.kind === "agent");
  const activeAgents = agents.filter((a) => a.state !== "idle").length;
  const pending = sim.inbox.length;
  const totalEffort = sim.automatedMinutes + sim.humanMinutes;
  const agentShare = totalEffort > 0 ? Math.round((sim.automatedMinutes / totalEffort) * 100) : 0;

  const selectedDefinition = selected ? roster.find((a) => a.key === selected) : null;
  const selectedPerson = selected ? sim.people.find((p) => p.id === selected) : null;

  const pillBase =
    "rounded-pill border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-colors";

  return (
    <div className="border-altec-cream/10 rounded-card overflow-hidden border">
      {/* --- barra superior: reloj, controles y KPIs --- */}
      <div className="border-altec-cream/10 bg-altec-dark-gray flex flex-wrap items-center gap-x-6 gap-y-3 border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-lg text-altec-cream tabular-nums">{sim.clock()}</span>
          <span className="text-altec-cream/45 font-mono text-[10px] uppercase">
            {sim.dayName()}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => sim.togglePause()}
            className={cn(pillBase, "border-altec-cream/25 text-altec-cream hover:border-altec-cream/60")}
          >
            {sim.paused ? "▶ Reanudar" : "❚❚ Pausa"}
          </button>

          <div className="flex overflow-hidden rounded-pill border border-altec-cream/20">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sim.setSpeed(s)}
                aria-pressed={sim.speed === s}
                className={cn(
                  "px-2.5 py-1.5 font-mono text-[10px]",
                  sim.speed === s
                    ? "bg-altec-green text-altec-black"
                    : "text-altec-cream/60 hover:text-altec-cream",
                )}
              >
                {s}×
              </button>
            ))}
          </div>

          <label className="text-altec-cream/55 ml-2 flex cursor-pointer items-center gap-1.5 text-[11px]">
            <input
              type="checkbox"
              checked={sim.autoApprove}
              onChange={(e) => sim.setAutoApprove(e.target.checked)}
              className="accent-altec-green"
            />
            Modo presentación
          </label>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-x-6 gap-y-2">
          <Kpi value={String(activeAgents)} label="Agentes activos" />
          <Kpi value={sim.automatedTasks.toLocaleString("es-MX")} label="Tareas automatizadas hoy" />
          <Kpi value={String(pending)} label="Esperan tu decisión" alert={pending > 0} />

          <div className="min-w-[150px]">
            <div className="bg-altec-cream/10 h-1.5 w-full overflow-hidden rounded-full">
              <div
                className="bg-altec-green h-full rounded-full transition-[width] duration-500"
                style={{ width: `${agentShare}%` }}
              />
            </div>
            <p className="text-altec-cream/45 mt-1 font-mono text-[10px]">
              {agentShare}% agentes · {100 - agentShare}% tú — meta 80/20
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px]">
        {/* --- la oficina --- */}
        <div className="relative h-[460px] md:h-[600px] lg:h-[660px]">
          <OfficeCanvas
            sim={sim}
            script={script}
            view={view}
            overlay={overlay}
            autoCam={autoCam}
            onUserMove={() => setAutoCam(false)}
            onAutoView={setView}
            theme={sceneThemes[themeId]}
            selectedAgent={selected}
            onSelectAgent={setSelected}
          />

          <div ref={overlay} className="pointer-events-none absolute inset-0 overflow-hidden" />

          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
            {cameraViews.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                aria-pressed={view === v.id}
                className={cn(
                  pillBase,
                  view === v.id
                    ? "border-altec-green bg-altec-green text-altec-black"
                    : "border-altec-cream/20 text-altec-cream/70 hover:border-altec-cream/50 bg-altec-black/60 backdrop-blur",
                )}
              >
                {v.label}
              </button>
            ))}
            <label className="text-altec-cream/60 bg-altec-black/60 rounded-pill ml-1 flex cursor-pointer items-center gap-1.5 px-2.5 py-1.5 text-[10px] backdrop-blur">
              <input
                type="checkbox"
                checked={autoCam}
                onChange={(e) => setAutoCam(e.target.checked)}
                className="accent-altec-green"
              />
              Cámara automática
            </label>
          </div>

          <div className="absolute top-3 right-3 flex gap-1.5">
            {(Object.keys(sceneThemes) as SceneThemeId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setThemeId(id)}
                aria-pressed={themeId === id}
                className={cn(
                  pillBase,
                  themeId === id
                    ? "border-altec-cream/60 text-altec-cream bg-altec-black/70 backdrop-blur"
                    : "border-altec-cream/15 text-altec-cream/45 hover:border-altec-cream/40 bg-altec-black/50 backdrop-blur",
                )}
              >
                {id === "studio" ? "Original" : "ALTEC"}
              </button>
            ))}
          </div>

          {pending > 0 ? (
            <button
              type="button"
              onClick={() => setTab("inbox")}
              className="bg-vo-awaiting text-altec-black rounded-pill absolute bottom-14 left-3 px-3.5 py-2 text-xs font-semibold shadow-lg"
            >
              {pending} {pending === 1 ? "decisión espera" : "decisiones esperan"} · Revisar
            </button>
          ) : null}

          <div className="absolute bottom-3 left-3 flex flex-wrap gap-x-3 gap-y-1">
            {legend.map((item) => (
              <span key={item.state} className="text-altec-cream/45 flex items-center gap-1.5 text-[10px]">
                <span className={cn("h-1.5 w-1.5 rounded-full", stateDots[item.state])} />
                {item.label}
              </span>
            ))}
          </div>

          <p className="text-altec-cream/35 absolute right-3 bottom-3 font-mono text-[10px]">
            arrastra para girar · rueda para acercar
          </p>
        </div>

        {/* --- panel lateral --- */}
        <aside className="border-altec-cream/10 bg-altec-dark-gray flex max-h-[660px] flex-col border-t lg:border-t-0 lg:border-l">
          <div className="border-altec-cream/10 flex border-b">
            {([
              ["team", "Equipo"],
              ["inbox", "Bandeja"],
              ["feed", "Actividad"],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 py-3 text-xs transition-colors",
                  tab === id
                    ? "text-altec-cream border-altec-green border-b-2"
                    : "text-altec-cream/50 hover:text-altec-cream/80",
                )}
              >
                {label}
                {id === "inbox" && pending > 0 ? (
                  <span className="bg-vo-awaiting text-altec-black rounded-full px-1.5 text-[10px] font-semibold">
                    {pending}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          {/* franja de clientes */}
          <div className="border-altec-cream/10 flex gap-2 overflow-x-auto border-b px-3 py-2.5">
            {sim.clients.map((client) => (
              <div key={client.name} className="min-w-[140px] shrink-0">
                <p className="text-altec-cream truncate text-[11px]">{client.name}</p>
                <p className="text-altec-cream/40 truncate text-[10px]">{client.service}</p>
                <div className="bg-altec-cream/10 mt-1 h-1 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-vo-meeting h-full rounded-full transition-[width] duration-700"
                    style={{ width: `${client.progress}%` }}
                  />
                </div>
                <p className="text-altec-cream/45 mt-0.5 truncate text-[10px]">{client.stage}</p>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {tab === "team" ? (
              selectedDefinition && selectedPerson ? (
                <div className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="text-altec-cream/55 hover:text-altec-cream font-mono text-[10px] uppercase"
                  >
                    ← Volver al equipo
                  </button>

                  <h3 className="font-display text-altec-cream mt-4 text-lg font-extrabold italic">
                    {selectedDefinition.displayName}
                  </h3>
                  <p className="text-altec-green font-mono text-[11px]">{selectedDefinition.role}</p>

                  <p className="text-altec-cream/55 mt-3 flex items-center gap-1.5 text-[11px]">
                    <span className={cn("h-1.5 w-1.5 rounded-full", stateDots[selectedPerson.state])} />
                    {stateLabels[selectedPerson.state]} · {selectedPerson.task}
                  </p>

                  <p className="text-altec-cream/65 mt-4 text-xs leading-relaxed">
                    {selectedDefinition.persona}
                  </p>

                  <Header>Cola de trabajo</Header>
                  <ul className="mt-2 flex flex-col gap-1">
                    {sim.workOf(selectedPerson).queue.slice(-5).reverse().map((item, i) => (
                      <li key={i} className="text-altec-cream/60 flex gap-2 text-[11px]">
                        <span className="text-altec-cream/35 font-mono">{item.status}</span>
                        <span className="min-w-0 flex-1">{item.text}</span>
                      </li>
                    ))}
                  </ul>

                  <Header>Skills</Header>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {selectedDefinition.skills.map((skill) => (
                      <li
                        key={skill}
                        className="border-altec-cream/15 text-altec-cream/70 rounded-pill border px-2.5 py-1 text-[10px]"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>

                  <Header>Contexto cargado</Header>
                  <ul className="text-altec-cream/60 mt-2 flex flex-col gap-1 text-[11px]">
                    {selectedDefinition.context.map((item) => (
                      <li key={item}>· {item}</li>
                    ))}
                  </ul>

                  <Header>Hoy</Header>
                  <p className="text-altec-cream/60 mt-2 text-[11px]">
                    {sim.workOf(selectedPerson).done} tareas cerradas ·{" "}
                    {sim.workOf(selectedPerson).automated} automatizadas
                  </p>
                </div>
              ) : (
                <ul>
                  {agents.map((person) => {
                    const definition = roster.find((a) => a.key === person.id);
                    return (
                      <li key={person.id}>
                        <button
                          type="button"
                          onClick={() => setSelected(person.id)}
                          className="hover:bg-altec-cream/5 border-altec-cream/5 flex w-full items-start gap-3 border-b px-5 py-3 text-left"
                        >
                          <span
                            className={cn(
                              "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                              stateDots[person.state],
                            )}
                          />
                          <span className="min-w-0">
                            <span className="text-altec-cream block text-sm">
                              {definition?.displayName ?? person.label}
                            </span>
                            <span className="text-altec-cream/50 block text-[11px]">
                              {definition?.role}
                            </span>
                            <span className="text-altec-cream/40 mt-0.5 block truncate text-[11px]">
                              {stateLabels[person.state]} · {person.task}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )
            ) : null}

            {tab === "inbox" ? (
              sim.inbox.length === 0 ? (
                <p className="text-altec-cream/40 px-5 py-8 text-center text-xs">
                  Nada espera tu decisión. Los agentes siguen trabajando.
                </p>
              ) : (
                <ul className="flex flex-col gap-3 p-4">
                  {sim.inbox.map((decision) => (
                    <li
                      key={decision.id}
                      className="border-vo-awaiting/40 bg-vo-awaiting/5 rounded-card border p-4"
                    >
                      <p className="text-vo-awaiting font-mono text-[10px] uppercase">
                        {decision.agentName} espera tu decisión
                      </p>
                      <h4 className="text-altec-cream mt-1.5 text-sm font-semibold">
                        {decision.title}
                      </h4>
                      {decision.amount ? (
                        <p className="text-altec-cream/70 mt-0.5 font-mono text-[11px]">
                          {decision.amount}
                        </p>
                      ) : null}
                      <ul className="text-altec-cream/60 mt-3 flex flex-col gap-1 text-[11px]">
                        {decision.bullets.map((b) => (
                          <li key={b}>· {b}</li>
                        ))}
                      </ul>
                      <div className="mt-4 flex gap-2">
                        <button
                          type="button"
                          onClick={() => decision.resolve("approve")}
                          className="bg-altec-green text-altec-black rounded-pill px-4 py-2 text-xs font-semibold"
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          onClick={() => decision.resolve("changes")}
                          className="border-altec-cream/30 text-altec-cream rounded-pill border px-4 py-2 text-xs"
                        >
                          Pedir ajustes
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )
            ) : null}

            {tab === "feed" ? (
              <ul className="flex flex-col">
                {sim.feed.map((entry) => (
                  <li
                    key={entry.id}
                    className="border-altec-cream/5 flex gap-2.5 border-b px-4 py-2.5 text-[11px]"
                  >
                    <span className="text-altec-cream/35 font-mono tabular-nums">{entry.time}</span>
                    <span className="min-w-0 flex-1">
                      {entry.who ? (
                        <span style={{ color: entry.color }} className="font-semibold">
                          {entry.who}{" "}
                        </span>
                      ) : null}
                      <span className="text-altec-cream/65">{entry.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Kpi({ value, label, alert = false }: { value: string; label: string; alert?: boolean }) {
  return (
    <div>
      <p
        className={cn(
          "font-display text-xl leading-none font-extrabold italic tabular-nums",
          alert ? "text-vo-awaiting" : "text-altec-cream",
        )}
      >
        {value}
      </p>
      <p className="text-altec-cream/45 mt-0.5 font-mono text-[10px]">{label}</p>
    </div>
  );
}

function Header({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-altec-cream/90 mt-5 text-[10px] tracking-[0.18em] uppercase">{children}</h4>
  );
}
