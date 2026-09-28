import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { CONTENT, checkScope, loadContent, logAccess } from "@/lib/access";
import {
  CAMILA_MODEL,
  isNotConnected,
  cachedSystem,
  claude,
  textOf,
} from "@/lib/camila/claude";
import { agentByKey } from "@altec/agents";
import { buildSystemPrompt } from "@/lib/camila/prompt";

/** Preguntas en vivo. La latencia importa: es una sala esperando. */
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_HISTORY = 20;
const MAX_QUESTION = 800;

export async function POST(request: Request) {
  const access = await checkScope("camila");
  if (access.state !== "allowed") {
    if (access.state === "denied") await logAccess("camila", "denied", access.email);
    return NextResponse.json({ error: "Sin acceso." }, { status: 401 });
  }

  // El expediente sale de la base, no del repositorio, y solo lo devuelve a
  // quien tiene el ambito: la comprobacion la hace la politica RLS.
  const dossier = await loadContent(CONTENT.camilaDossier);
  if (!dossier) {
    return NextResponse.json({ error: "El expediente no está cargado." }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    message?: string;
    history?: Anthropic.MessageParam[];
  };

  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) {
    return NextResponse.json({ error: "Falta la pregunta." }, { status: 400 });
  }
  if (message.length > MAX_QUESTION) {
    return NextResponse.json({ error: "La pregunta es demasiado larga." }, { status: 400 });
  }

  // El historial llega del navegador, asi que se recorta y se sanea: solo
  // turnos de usuario y asistente con texto.
  const history = (Array.isArray(body.history) ? body.history : [])
    .filter(
      (turn): turn is Anthropic.MessageParam =>
        Boolean(turn) &&
        (turn.role === "user" || turn.role === "assistant") &&
        typeof turn.content === "string",
    )
    .slice(-MAX_HISTORY);

  try {
    const response = await claude().messages.create({
      model: CAMILA_MODEL,
      max_tokens: 700,
      system: cachedSystem(systemPrompt(dossier)),
      // Efecto pensado: es una conversacion en vivo, no un analisis. El
      // esfuerzo bajo mantiene la respuesta en un par de segundos.
      output_config: { effort: "low" },
      messages: [...history, { role: "user", content: message }],
    });

    if (response.stop_reason === "refusal") {
      return NextResponse.json({
        response: "Prefiero no responder eso. ¿Te parece si lo vemos con Agustín?",
      });
    }

    return NextResponse.json({ response: textOf(response) });
  } catch (error) {
    if (isNotConnected(error) || error instanceof Anthropic.AuthenticationError) {
      console.error("[camila] ANTHROPIC_API_KEY inválida o ausente.");
      return NextResponse.json({ error: "Camila no está conectada." }, { status: 503 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "Demasiadas preguntas seguidas. Intenta en unos segundos." },
        { status: 429 },
      );
    }
    console.error("[camila] fallo al responder:", error);
    return NextResponse.json({ error: "Camila no pudo responder." }, { status: 500 });
  }
}

/**
 * El contexto ya no se guarda entre peticiones.
 *
 * Antes se armaba una vez por arranque porque el expediente estaba escrito en
 * el codigo y no cambiaba nunca. Ahora vive en Supabase: si alguien corrige una
 * cifra, la siguiente respuesta tiene que llevarla, no la que tocara reiniciar.
 * El ahorro que daba el cache era de milisegundos; el prompt caching de la API
 * de Anthropic sigue funcionando igual, porque lo que se repite es el texto.
 */
function systemPrompt(dossier: string): string {
  const camila = agentByKey.get("camila");
  if (!camila) throw new Error("Camila no está en el roster.");
  return buildSystemPrompt(camila, dossier);
}
