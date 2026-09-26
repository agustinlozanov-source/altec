import "server-only";

import type { AgentDefinition } from "@altec/agents";

/**
 * Expediente confidencial de ALTEC y armado del contexto de un agente.
 *
 * El DOSSIER es confidencial: incluye el cap table, el punto de equilibrio y
 * el monto de la ronda. Nunca sale al navegador — el `import "server-only"` de
 * arriba hace que el build falle si alguien lo importa desde un componente de
 * cliente.
 *
 * La PERSONALIDAD de cada agente no vive aqui: vive en `packages/agents`, que
 * si es publico. El contexto final se arma juntando las dos cosas, asi que dar
 * de alta un agente real nuevo no obliga a duplicar el expediente.
 */

const ALTEC_DOSSIER = `
## Sobre ALTEC Group

### Qué es
ALTEC Group SAPI de CV es un holding que agrupa 5 empresas bajo la categoría ALT: Advisory, Learning & Technology. Fundado por Agustín Lozano. Sede en CDMX, Reforma 445.

### Las 5 empresas

1. **Flow Hub** — Tecnología e Inteligencia Comercial. CRM con IA, automatizaciones, fábrica de software. +40 sistemas creados, +1,300 automatizaciones, +60 agentes IA. Modelo SaaS (MRR/ARR). Razón social: Flow Hub Tecnología e Inteligencia Comercial S.A. de C.V. — Constituida. Primera línea de producción del grupo.

2. **ScaleX Latam** — Consultoría de escalabilidad. Método propio DX21 (7 pilares × 3 lentes, 41 dimensiones, 164 sub-dimensiones). Libro publicado: "Método de Escala para PyMEs Latinoamericanas". Plataforma: app.scalexlatam.com con 4 herramientas (SCANx, SCALEx, TEAMx, BOARDx). Escala por licencias a consultores independientes.

3. **Avalluo / Quantía** — Valuación de activos. Dictaminación pericial de activos tangibles e intangibles. +12,000 activos valuados, alcance nacional 32 estados. Plataforma propia que reduce tiempos 200-300% vs competidores. Razón social: Quantía Inteligencia en Valuación S.A. de C.V. — Constituida.

4. **Boston Skilling Center** — Educación ejecutiva y capacitación empresarial. Motor de generación de leads para todas las empresas del grupo mediante eventos educativos semanales.

5. **Photocan** — Marketing y producción audiovisual. Branding, contenido, comunicación corporativa.

### La categoría ALT
Advisory · Learning · Technology. Tres industrias que se venden por separado pero ALTEC las integra en un ciclo donde cada una alimenta a las demás. No es una categoría existente — ALTEC la está creando.

### Gobierno corporativo — Los 3 pilares
1. **OPSP** (One Page Strategic Plan) — Plan estratégico vivo de cada empresa, revisado trimestralmente.
2. **Launch Gate** — Sistema de validación de productos con 12 dimensiones. Nada se vende sin pasar por aquí.
3. **Forecast** — Proyección de equipo, talento y capacidad a 12 meses.

### Equipo fundador
- **Agustín Lozano** — CEO & Founder. 45 años. Creador de las 5 empresas. MBA (UADE Buenos Aires), Lic. Mercadotecnia Internacional (UDEM). 14+ años en escalabilidad organizacional. Conferencista TEDx. Se reubica a CDMX para dirigir el grupo.
- **Mario Moreno Cortés** — COO. Cofundador de Flow Hub y Avalluo. Operación y tecnología.
- **Román Cantú** — CRO / Relaciones con Inversionistas. Red de contactos institucionales.
- **Gumaro Bracho** — Director de Estrategia. Wolfgang Consulting Group.

### Cap Table
- Agustín Lozano: 25%
- Mario Moreno: 18%
- Román Cantú: 12%
- Gumaro Bracho: 10%
- Inversionista: 25%
- Pool Serie B: 10%

### Números clave
- Punto de equilibrio del holding: $350,400 MXN/mes
- Mercado de consultoría en México: $2,810M USD (crecimiento 8.79%)
- Mercado EdTech LATAM: $4,900M USD (crecimiento 12.76%)
- +4 millones de PyMEs en México

### BHAG (Visión a 10 años)
Para 2035, ALTEC será el grupo de referencia en la categoría ALT en Latinoamérica, con presencia en 5+ países, una red de +500 consultores certificados y un portafolio de empresas que genere más de $500M MXN anuales.

### Máquina de revenue
Eventos educativos semanales → generan cash flow + leads → convierten en consultoría y sistemas. Flow Hub es la primera línea de producción (Trimestre 1), ScaleX la segunda (Trimestre 2).

### Inversión buscada
$200,000 USD para constituir el holding, relocalizar a CDMX y arrancar operaciones.

## Sobre AltecVO (Virtual Office)
AltecVO es la oficina virtual de ALTEC. Un dashboard donde cada rol de consultoría está representado por un agente de IA. Modelo 80/20: la firma escala con agentes de IA operando, no con headcount como las firmas tradicionales.

El VO tiene áreas: Laboratorio de Análisis, Oficina del Socio, Sala de Juntas, General, Consultoría, Motor de Automatización, Gestión de Proyectos, Zona de Partner, Recepción de Clientes, Lounge.

## Sobre Altec Health Learning
Vertical enfocada en investigación aplicada sobre salud mental y física de las personas. No es wellness genérico — es investigación seria, basada en datos, que produce herramientas accionables para líderes, emprendedores y equipos directivos. La dirige Camila Fuentes.
`.trim();

/**
 * Arma el contexto de un agente: quien es (publico, de packages/agents) mas lo
 * que sabe de ALTEC (confidencial, de aqui).
 *
 * Solo acepta agentes marcados como `real`. Los puestos de relleno no tienen
 * personalidad trabajada ni reglas de escalamiento, y soltarlos a hablar con
 * inversionistas seria improvisar en su nombre.
 */
export function buildSystemPrompt(agent: AgentDefinition, extra?: string): string {
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
    ALTEC_DOSSIER,
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
