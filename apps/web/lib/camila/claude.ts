import Anthropic from "@anthropic-ai/sdk";

/**
 * Cliente de Claude, el cerebro de Camila.
 *
 * Modelo: `claude-opus-5`. El plan tecnico traia `claude-sonnet-4-20250514`,
 * que ya no existe, y un precio que no corresponde a ningun modelo vigente.
 * Si se quiere abaratar, `claude-sonnet-5` es un cambio de una linea.
 */
export const CAMILA_MODEL = "claude-opus-5";

let client: Anthropic | null = null;

/**
 * Se comprueba por nombre y no con `instanceof`: el empaquetador puede cargar
 * este modulo dos veces, y entonces la clase lanzada no es la misma clase que
 * ve la ruta.
 */
/** Distingue "no hay credencial" de cualquier otro fallo de la API. */
export function isNotConnected(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  // El SDK resuelve la credencial al hacer la peticion, no al construir el
  // cliente, asi que sin llave el fallo llega aqui como Error normal.
  return error.message.includes("Could not resolve authentication method");
}

export function claude(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

/**
 * El contexto de Camila es largo y no cambia nunca, asi que se cachea. A
 * partir de la segunda pregunta el prefijo cuesta una decima parte, que en una
 * sesion de preguntas en vivo es la diferencia entre centavos y dolares.
 */
export function cachedSystem(prompt: string): Anthropic.TextBlockParam[] {
  return [{ type: "text", text: prompt, cache_control: { type: "ephemeral" } }];
}

/** Junta los bloques de texto de una respuesta. */
export function textOf(message: Anthropic.Message): string {
  return message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();
}
