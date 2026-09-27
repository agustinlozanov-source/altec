"use client";

import { useRef, useState } from "react";
import { Button, cn } from "@altec/ui";

/**
 * Consola de Camila: presentación autónoma y preguntas en vivo.
 *
 * El avatar de HeyGen se conecta si hay credenciales. Si no las hay, la
 * consola sigue funcionando con la transcripción y los tiempos de habla
 * simulados, para poder ensayar el guion sin gastar créditos.
 */

type Turn = { id: number; speaker: "Camila" | "Tú"; text: string };
type Phase = "idle" | "preparando" | "presentando" | "pensando";

let nextId = 1;

export function CamilaConsole() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState("Listo. Puedes iniciar la presentación o preguntarle algo.");
  const [question, setQuestion] = useState("");
  const [avatarReady, setAvatarReady] = useState(false);
  const history = useRef<{ role: "user" | "assistant"; content: string }[]>([]);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const say = (speaker: Turn["speaker"], text: string) => {
    setTurns((prev) => [...prev, { id: nextId++, speaker, text }]);
    queueMicrotask(() => {
      const node = transcriptRef.current;
      if (node) node.scrollTop = node.scrollHeight;
    });
  };

  /**
   * Hace hablar al avatar. Mientras no esté conectado el SDK de HeyGen,
   * espera el tiempo que tardaría en decirlo, para que los tiempos del ensayo
   * sean los reales.
   */
  const speak = async (text: string) => {
    if (avatarReady) {
      // Punto de conexión del SDK de LiveAvatar:
      // await session.speak(text);
    }
    const words = text.split(/\s+/).length;
    await wait((words / 150) * 60 * 1000);
  };

  const connectAvatar = async () => {
    setStatus("Conectando con el avatar…");
    try {
      const res = await fetch("/api/camila/heygen-token", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo conectar.");
      setAvatarReady(true);
      setStatus("Avatar conectado.");
    } catch (error) {
      setAvatarReady(false);
      setStatus(
        error instanceof Error
          ? `${error.message} La consola sigue funcionando sin avatar.`
          : "No se pudo conectar el avatar.",
      );
    }
  };

  const startPresentation = async () => {
    setPhase("preparando");
    setStatus("Camila está preparando su presentación…");

    try {
      const res = await fetch("/api/camila/presentation", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo preparar.");

      setPhase("presentando");
      setStatus("Camila está presentando.");

      for (const block of data.blocks as string[]) {
        say("Camila", block);
        await speak(block);
        await wait(1200);
      }

      setStatus("Presentación terminada. Ahora puedes preguntarle.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error al presentar.");
    }
    setPhase("idle");
  };

  const ask = async () => {
    const text = question.trim();
    if (!text || phase !== "idle") return;

    setQuestion("");
    say("Tú", text);
    setPhase("pensando");
    setStatus("Camila está pensando…");

    try {
      const res = await fetch("/api/camila/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: history.current }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No pudo responder.");

      history.current = [
        ...history.current,
        { role: "user" as const, content: text },
        { role: "assistant" as const, content: String(data.response) },
      ].slice(-20);

      say("Camila", data.response);
      await speak(data.response);
      setStatus("Listo para la siguiente pregunta.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Error al responder.");
    }
    setPhase("idle");
  };

  const busy = phase !== "idle";

  return (
    <div className="border-line rounded-card overflow-hidden border">
      <div className="grid lg:grid-cols-[1.15fr_1fr]">
        {/* --- avatar --- */}
        <div className="bg-card relative flex aspect-video items-center justify-center">
          <div className="px-6 text-center">
            <p className="font-display text-ink text-2xl font-extrabold">Camila Fuentes</p>
            <p className="text-muted mt-1 text-xs">Senior Partner AI · ALTEC Virtual Office</p>
            <p className="text-muted mt-4 font-mono text-[11px]">
              {avatarReady ? "Avatar conectado" : "Avatar sin conectar"}
            </p>
            {!avatarReady ? (
              <button
                type="button"
                onClick={connectAvatar}
                className="border-line-strong text-muted hover:text-ink rounded-pill mt-3 border px-3 py-1.5 font-mono text-[10px] uppercase"
              >
                Conectar avatar
              </button>
            ) : null}
          </div>

          {busy ? (
            <span className="bg-vo-working absolute top-3 left-3 h-2 w-2 animate-pulse rounded-full" />
          ) : null}
        </div>

        {/* --- transcripción y controles --- */}
        <div className="border-line flex max-h-[520px] flex-col border-t lg:border-t-0 lg:border-l">
          <div
            ref={transcriptRef}
            className="flex-1 overflow-y-auto px-5 py-4"
            aria-live="polite"
          >
            {turns.length === 0 ? (
              <p className="text-muted text-xs">
                La transcripción aparece aquí. Sirve de respaldo si falla el audio en la sala.
              </p>
            ) : (
              <ul className="flex flex-col gap-3">
                {turns.map((turn) => (
                  <li key={turn.id} className="text-xs leading-relaxed">
                    <span
                      className={cn(
                        "font-semibold",
                        turn.speaker === "Camila" ? "text-accent-ink" : "text-muted",
                      )}
                    >
                      {turn.speaker}:{" "}
                    </span>
                    <span className="text-ink">{turn.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-line flex flex-col gap-3 border-t p-4">
            <Button onClick={startPresentation} disabled={busy} size="sm" className="self-start">
              {phase === "preparando" || phase === "presentando"
                ? "Presentando…"
                : "Iniciar presentación"}
            </Button>

            <div className="flex gap-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") ask();
                }}
                disabled={busy}
                placeholder="Hazle una pregunta a Camila…"
                aria-label="Pregunta para Camila"
                className="border-line bg-card text-ink placeholder:text-muted focus:border-accent-ink rounded-card min-w-0 flex-1 border px-3 py-2 text-xs focus:outline-none disabled:opacity-50"
              />
              <Button onClick={ask} disabled={busy || !question.trim()} variant="secondary" size="sm">
                Enviar
              </Button>
            </div>

            <p className="text-muted font-mono text-[10px]">{status}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
