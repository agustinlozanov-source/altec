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
import { buildSystemPrompt, PRESENTATION_PROMPT } from "@/lib/camila/prompt";

/**
 * Genera la presentación completa y la devuelve partida en bloques, uno por
 * cada intervención del avatar.
 */
export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST() {
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

  try {
    // Se transmite porque son varios miles de tokens: sin streaming la
    // peticion puede pasarse del tiempo limite.
    const stream = claude().messages.stream({
      model: CAMILA_MODEL,
      max_tokens: 8000,
      system: cachedSystem(systemPrompt(dossier)),
      output_config: { effort: "high" },
      messages: [{ role: "user", content: PRESENTATION_PROMPT }],
    });

    const response = await stream.finalMessage();

    if (response.stop_reason === "refusal") {
      return NextResponse.json({ error: "Camila no generó la presentación." }, { status: 502 });
    }

    const blocks = textOf(response)
      .split(/^\s*---\s*$/m)
      .map((block) => block.trim())
      .filter(Boolean);

    if (blocks.length === 0) {
      return NextResponse.json({ error: "La presentación salió vacía." }, { status: 502 });
    }

    return NextResponse.json({ blocks });
  } catch (error) {
    if (isNotConnected(error) || error instanceof Anthropic.AuthenticationError) {
      console.error("[camila] ANTHROPIC_API_KEY inválida o ausente.");
      return NextResponse.json({ error: "Camila no está conectada." }, { status: 503 });
    }
    console.error("[camila] fallo al preparar la presentación:", error);
    return NextResponse.json({ error: "No se pudo preparar la presentación." }, { status: 500 });
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
