import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { hasAccess } from "@/lib/camila/access";
import {
  CAMILA_MODEL,
  isNotConnected,
  cachedSystem,
  claude,
  textOf,
} from "@/lib/camila/claude";
import { CAMILA_SYSTEM_PROMPT } from "@/lib/camila/prompt";

/** Preguntas en vivo. La latencia importa: es una sala esperando. */
export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_HISTORY = 20;
const MAX_QUESTION = 800;

export async function POST(request: Request) {
  if (!(await hasAccess())) {
    return NextResponse.json({ error: "Sin acceso." }, { status: 401 });
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
      system: cachedSystem(CAMILA_SYSTEM_PROMPT),
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
