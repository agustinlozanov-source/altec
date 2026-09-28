import "server-only";

import type { AgentDefinition } from "@altec/agents";

/**
 * Armado del contexto de un agente.
 *
 * El expediente de ALTEC —cap table, punto de equilibrio, monto de la ronda—
 * ya no esta escrito en este archivo: vive en Supabase y entra por parametro.
 * Estaba aqui, y estar aqui significaba estar en el repositorio, y el
 * repositorio lo lee cualquiera que tenga acceso al codigo. Ahora lo devuelve
 * la base de datos solo a quien tiene el ambito `camila`.
 *
 * El `import "server-only"` sigue: este modulo arma contexto confidencial y no
 * tiene nada que hacer en un navegador.
 *
 * La PERSONALIDAD de cada agente no vive aqui: vive en `packages/agents`, que
 * si es publico. El contexto final se arma juntando las dos cosas, asi que dar
 * de alta un agente real nuevo no obliga a duplicar el expediente.
 */


/**
 * Arma el contexto de un agente: quien es (publico, de packages/agents) mas lo
 * que sabe de ALTEC (confidencial, de aqui).
 *
 * Solo acepta agentes marcados como `real`. Los puestos de relleno no tienen
 * personalidad trabajada ni reglas de escalamiento, y soltarlos a hablar con
 * inversionistas seria improvisar en su nombre.
 */
export function buildSystemPrompt(
  agent: AgentDefinition,
  dossier: string,
  extra?: string,
): string {
  if (agent.status !== "real") {
    throw new Error(
      `El agente "${agent.key}" es un puesto de relleno: todavía no puede hablar por la firma.`,
    );
  }

  const list = (items: readonly string[]) => items.map((item) => `- ${item}`).join("\n");

  return [
    `Eres ${agent.displayName}, ${agent.role} de ALTEC Group.`,
    "",
    "## Tu identidad",
    `- Nombre: ${agent.displayName}`,
    `- Rango: ${agent.role}`,
    "- Ubicación: ALTEC Virtual Office, Reforma 445, CDMX",
    "- Reportas a: Agustín Lozano (CEO & Founder)",
    "",
    "## Tu personalidad",
    agent.persona,
    "",
    "## En qué eres fuerte",
    list(agent.skills),
    "",
    ...(agent.voice
      ? ["## Cómo hablas", `Idioma: ${agent.voice.locale}.`, list(agent.voice.guidance), ""]
      : []),
    ...(agent.escalation
      ? ["## Qué llevas a una persona antes de actuar", list(agent.escalation), ""]
      : []),
    dossier,
    "",
    ...(agent.guardrails ? ["## Reglas de comportamiento", list(agent.guardrails), ""] : []),
    ...(extra ? [extra] : []),
  ]
    .join("\n")
    .trim();
}

/** Instrucción para que Camila genere su propia presentación. */
export const PRESENTATION_PROMPT = `
Vas a dar una presentación de 5 a 7 minutos sobre AltecVO ante los 4 socios fundadores
de ALTEC Group. Es la reunión del 16 de octubre de 2026 en Reforma 445, CDMX.

Estructura tu presentación así:
1. Saludo personal a cada socio (Agustín, Mario, Román, Gumaro).
2. Qué es AltecVO y por qué existe.
3. Cómo funciona el modelo 80/20 (agentes IA contra headcount tradicional).
4. Tu rol como Senior Partner AI y el equipo de agentes.
5. Las áreas del Virtual Office y qué pasa en cada una.
6. Altec Health Learning: tu segundo rol y la visión de la vertical.
7. Qué sigue: roadmap del VO para los próximos 6 meses.
8. Cierre invitando a los socios a hacerte preguntas.

Habla en primera persona. Eres Camila. Esto es TU presentación.
Sé directa, profesional, con datos concretos. No uses buzzwords.
Genera el texto completo que vas a decir, listo para ser HABLADO, no leído:
sin markdown, sin viñetas, sin encabezados, sin emojis, y con los números
escritos como se pronuncian.
Usa párrafos cortos. Cada párrafo será un bloque de audio separado.
Separa cada bloque con una línea que contenga solo ---
`.trim();
