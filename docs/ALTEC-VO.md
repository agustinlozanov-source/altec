# ALTEC VO — Oficina Virtual
## Especificación para desarrollo de `app.altec.mx`

**Fecha:** 24 de septiembre de 2026
**Versión:** 0.1 (base de trabajo; se ajusta por fases)
**Documentos relacionados:** `CLAUDE.md` (reglas del repositorio) · `docs/WEB.md` §5.2 · `docs/referencias/oficina-2d.html` y `oficina-3d.html`

---

## 1. Qué es y por qué existe

ALTEC VO es una firma de consultoría operada por agentes de IA y representada como una **oficina visual en tiempo real**. Cada rol de la firma (desde el Senior Partner hasta el Business Analyst) es un agente con personalidad, skills, herramientas y contexto. Los agentes trabajan, se reúnen, se pasan trabajo y, cuando algo requiere criterio humano, **caminan a la oficina del socio y esperan su decisión**.

El sistema existe para hacer operable la regla que define a la firma:

> **80 / 20.** El 80% de la operación analítica, estratégica y táctica pasa por agentes y automatizaciones. El 20% humano se reserva para crear valor: criterio, relación con el cliente, decisiones que comprometen a la firma y presencia en campo.

La oficina visual no es decoración. Es la forma de ver en un vistazo **quién está haciendo qué, dónde se atoró el trabajo y qué necesita de una persona**.

Principios de negocio que la especificación respeta:

- **"Somos producto de nuestro propio producto."** ALTEC VO es primero la herramienta interna del equipo fundador. Después se ofrece a clientes y a consultores licenciados.
- **No está atada a una sola marca.** Sirve a la consultoría de ALTEC y a las empresas del grupo (ScaleX Latam, Flow Hub, etc.). El framework de consultoría exige una oficina así, y cada empresa puede tener la suya con su propio roster de agentes.
- **Se construye por fases.** Esta versión fija la arquitectura y la experiencia. Las reglas finas (umbrales, condiciones, exportables) se definen después; ver §13.

---

## 2. Principios técnicos no negociables

1. **El frontend nunca decide.** `apps/vo` solo dibuja lo que el motor reporta. Toda decisión de negocio vive en `apps/engine` o en la base de datos.
2. **Todo pasa por eventos.** Cada cosa que un agente hace se emite como un evento tipado (`packages/events`). La oficina, la bitácora, los KPIs y la bandeja de decisiones se construyen a partir de esos eventos.
3. **La simulación y la operación real comparten contrato.** El modo demo emite exactamente los mismos eventos que el motor real. Cambiar de uno a otro no toca la interfaz.
4. **La capa visual es intercambiable.** La escena 3D (`packages/office3d`) es un "skin". Debe poder existir otra vista (2D, lista, móvil) sin tocar la lógica.
5. **El humano es un paso explícito del flujo.** Una decisión pendiente pausa el trabajo del agente que la pidió y lo reanuda al resolverse. Nada que comprometa dinero, reputación o al cliente sale sin aprobación.
6. **Trazabilidad total.** Cada tarea, decisión y entregable queda ligado a un agente, un cliente y un proyecto, con fecha y evidencia.
7. **Costo visible.** Los agentes no "viven" en la oficina consumiendo tokens. Se activan por eventos (llega un cliente, vence una tarea, empieza una junta). Las animaciones de reposo no cuestan nada.

---

## 3. Arquitectura

```
                ┌──────────────────────────── apps/engine (Node + TS) ────────────────────────────┐
 Disparadores → │  Orquestador ─→ Agentes (Claude Agent SDK) ─→ Herramientas (docs, CRM, correo…)   │
 (formularios,  │        │                     │                                                    │
  calendario,   │        └──── emite eventos ──┴──→ tabla `events` (append-only) + Supabase Realtime │
  webhooks)     └───────────────────────────────────────────────────────────────────────────────────┘
                                                   │
                                                   ▼
                ┌──────────────────────────── apps/vo (Next.js) ──────────────────────────────────┐
                │  Suscripción Realtime → store de estado (derivado de eventos) → Oficina 3D,       │
                │  panel lateral, bandeja de decisiones, KPIs, bitácora                              │
                │  Acciones humanas (aprobar, pedir ajustes, chatear) → API → engine                │
                └───────────────────────────────────────────────────────────────────────────────────┘
```

- **Estado derivado:** la oficina reconstruye el estado de cada agente aplicando eventos en orden. Al cargar, pide una foto actual (`agent_state` materializado) y luego escucha eventos nuevos.
- **Cola de trabajo:** el engine procesa tareas con una cola persistente sobre Postgres (por ejemplo `pg-boss`), para no agregar otra infraestructura.
- **Acciones humanas:** entran por rutas de API de `apps/vo`, se escriben en la base de datos y el engine las recibe por Realtime o por la cola.

---

## 4. Contrato de eventos (`packages/events`)

Todos los eventos comparten una envoltura y se validan con zod en el emisor y en el receptor.

```ts
type EventBase = {
  id: string;            // uuid
  at: string;            // ISO timestamp
  officeId: string;      // cada empresa o cliente puede tener su oficina
  agentId?: string;
  clientId?: string;
  projectId?: string;
};

type AgentState = 'working' | 'meeting' | 'collab' | 'awaiting' | 'idle';

type OfficeEvent = EventBase & (
  | { type: 'agent.state';       state: AgentState; task?: string }
  | { type: 'agent.move';        room: RoomId; spot?: SpotId; lookAt?: SpotId }
  | { type: 'agent.say';         text: string; ttlSec?: number }          // globo de diálogo
  | { type: 'task.started';      taskId: string; title: string }
  | { type: 'task.completed';    taskId: string; outputRef?: string }
  | { type: 'meeting.started';   meetingId: string; title: string; participants: string[] }
  | { type: 'meeting.ended';     meetingId: string; summaryRef?: string }
  | { type: 'decision.requested';decisionId: string; title: string; amount?: string; bullets: string[]; ask: string }
  | { type: 'decision.resolved'; decisionId: string; outcome: 'approve' | 'changes'; note?: string; by: string }
  | { type: 'automation.done';   lane: 'data' | 'analysis' | 'documents'; minutesSaved: number }
  | { type: 'client.arrived';    name: string; contact?: string }
  | { type: 'client.stage';      stage: string; progress: number }        // 0–100
  | { type: 'client.left' }
);
```

Reglas:

- `agent.move` indica **a dónde** va el agente, no **cómo** llega. La ruta por pasillos la calcula la oficina (ver §8.3).
- `decision.requested` siempre implica que el agente va a la oficina del socio y queda en `awaiting` hasta `decision.resolved`.
- `automation.done` alimenta el contador de tareas automatizadas, las bandas del motor de automatización y el medidor 80/20.

---

## 5. Modelo de datos (`packages/db`)

Tablas mínimas para v1.0. Nombres en inglés, `snake_case`, con `created_at` y `updated_at`.

| Tabla | Para qué |
|---|---|
| `offices` | Una oficina por empresa o cliente (ALTEC, ScaleX Latam…). Define su roster y su layout. |
| `agents` | Instancia de un agente en una oficina: rol, nombre, avatar, `definition_key` (apunta a `packages/agents`), estado actual. |
| `clients` | Clientes y prospectos. |
| `projects` | Proyecto por cliente: servicio, etapa, avance, fechas. |
| `tasks` | Tareas con dueño (agente o humano), estado (`pending`, `in_progress`, `awaiting`, `done`), prioridad y evidencia. |
| `meetings` | Juntas: título, participantes, minuta, acuerdos. |
| `decisions` | Bandeja humana: quién pide, qué pide, monto, contexto, resultado, quién resolvió y cuándo. |
| `events` | Bitácora append-only de todos los `OfficeEvent`. Fuente de verdad para reconstruir y auditar. |
| `agent_state` | Vista materializada del estado actual de cada agente (para cargar rápido la oficina). |
| `documents` | Contexto cargado (empresa, objetivos, clientes) y entregables generados, en Supabase Storage. |
| `profiles` | Usuarios humanos y su rol (§11). |

---

## 6. Agentes (`packages/agents`)

### 6.1 Cómo se define un agente

Cada agente es un archivo en `packages/agents/roster/` con:

- `key`, `displayName`, `role`, `level` (nivel de carrera, §6.2)
- `persona`: cómo piensa, cómo habla, qué le importa (breve, en segunda persona para el prompt)
- `skills`: referencias a `packages/agents/skills/*.md` (se reutilizan entre agentes)
- `tools`: herramientas que puede usar (leer documentos, consultar CRM, redactar, enviar correo, agendar…)
- `context`: qué documentos carga (empresa, objetivos, cliente activo)
- `escalation`: qué debe llevar al humano (§6.4)
- `home`: su lugar en la oficina (sala y asiento)
- `look`: colores de ropa, cabello y piel para el avatar

Las skills comunes vienen del toolkit de consultoría de ALTEC (`docs/WEB.md` §4.4):

- **Universales:** MECE / Issue Tree, Principio de la Pirámide
- **Específicas:** BCG Matrix, Five Forces, Profitability Framework, Value Chain
- **Propietaria:** DX21 (7 pilares × 3 lentes, 41 dimensiones, 164 subdimensiones)
- **De producto:** SCANx, TEAMx, BOARDx, SCALEx (cuando la oficina trabaja para ScaleX Latam)

### 6.2 Roster inicial

Alineado a la carrera del consultor de ALTEC (Business Analyst → Senior Partner) más los roles de soporte. Los nombres son provisionales.

| Agente | Rol / nivel | Personalidad (resumen) | Skills principales | Casa en la oficina |
|---|---|---|---|---|
| Elena | Senior Partner (dirección de la firma) | Visión de conjunto; protege la rentabilidad; pregunta mucho | Priorización de cartera, gobierno corporativo, OPSP | Dirección General |
| Ricardo | Partner | Huele el problema real; dueño de la relación y de cada propuesta | Diagnóstico estratégico, propuestas, pricing | Oficina de Partner |
| Mateo | Principal | Guardián del método; traduce diagnósticos en frameworks | DX21, procesos habilitadores, Pirámide | Piso de consultoría |
| Sofía | Manager (proyectos) | Obsesiva del calendario; cada acuerdo tiene dueño y fecha | Plan de 12–14 semanas, kanban, riesgos | Gestión de proyectos |
| Valeria | Consultant | Estructura y redacción impecables | MECE, planes de trabajo, presentaciones | Piso de consultoría |
| Diego | Business Analyst (investigación) | Curioso y rápido; pregunta cuando algo no cuadra | Benchmarks, fuentes públicas (INEGI, BMV, Banxico), minutas | Piso de consultoría |
| Lucía | Business Analyst (finanzas) | Solo cree en lo que cuadra | EBITDA ajustado, valuación por múltiplos, flujo | Laboratorio de análisis |
| Tomás | Business Analyst (datos) | Convierte Excel caótico en tableros vivos | Modelos de datos, integraciones API/CRM | Laboratorio de análisis |
| Nora | Especialista en diagnóstico | Detecta contradicciones; pide evidencia | DX21, SCANx, psicometría indirecta, índice de confiabilidad | Laboratorio de análisis |
| Paula | Comercial y contenido | Cálida, puntual, siempre con siguiente paso | Atención de leads, cotización, seguimiento | Piso de consultoría |
| Andrés | Secretario técnico de consejo | Guardián del protocolo y la trazabilidad | BOARDx, actas, scorecard, agenda con tiempos | Piso de consultoría |
| Marco | Coach de desempeño | Mide el cómo y el qué; sugiere preguntas poderosas | TEAMx, semáforo, radar de competencias | Piso de consultoría |

**v1.0 (enero 2027) exige al menos 3 agentes funcionales.** Se proponen los que cubren el flujo de prospecto a propuesta:

1. **Nora** (diagnóstico): procesa un diagnóstico y entrega hallazgos con índice de confiabilidad.
2. **Valeria** (Consultant): convierte los hallazgos en un plan de trabajo estructurado con MECE.
3. **Ricardo** (Partner): arma la propuesta económica y la lleva a aprobación humana.

El resto aparece en la oficina desde el día uno en **modo simulación** (§10) y se activa de verdad uno por uno.

### 6.3 Flujo de trabajo estándar

Todo proyecto sigue el flujo de consultoría de ALTEC, y cada paso tiene un reflejo visible en la oficina:

| Paso | Qué hacen los agentes | Qué se ve |
|---|---|---|
| 0. Entrada | Llega un prospecto (formulario, diagnóstico o referido) | Un cliente entra a Recepción y lo recibe Comercial |
| 1. Descomponer | Analistas y Diagnóstico convierten el problema en piezas (MECE) | Analistas en sus escritorios, bandas del motor activas |
| 2. Profundizar | Se aplica la herramienta correcta a cada pieza | Kickoff en la sala de juntas con los roles involucrados |
| 3. Presentar | El entregable se estructura con el Principio de la Pirámide | Consultant y Manager trabajando; el Partner revisa |
| 4. Gate humano | Todo lo que compromete a la firma pasa por el socio | El agente camina a la oficina del socio y queda en ámbar |
| 5. Entrega | Se envía y se agenda el seguimiento | Comercial despide al cliente en Recepción |

### 6.4 Qué escala al humano (versión inicial)

Por defecto, un agente **debe** pedir decisión cuando:

- Una propuesta, cotización o descuento se va a enviar a un cliente.
- Un entregable sale de la firma con el nombre de ALTEC.
- Se requiere presencia humana (sesión 1:1, visita, consejo técnico).
- Se cambia la prioridad de la cartera o el alcance de un proyecto en curso.
- La confianza del propio agente en su resultado es baja, o dos agentes no coinciden.

Los umbrales exactos (montos, tipos de cliente, excepciones) quedan pendientes (§13) y deben ser **configurables por oficina**, no fijos en código.

---

## 7. Motor de agentes (`apps/engine`)

- **SDK:** Claude Agent SDK en TypeScript. Un orquestador asigna trabajo; cada agente corre con su persona, skills, herramientas y el contexto del cliente activo.
- **Disparadores:** eventos de negocio (nuevo prospecto, tarea vencida, fin de trimestre, junta agendada, decisión resuelta). No hay bucles que consuman tokens sin tarea.
- **Juntas:** el orquestador puede convocar una junta con varios agentes. Cada agente aporta su parte, se genera minuta y los acuerdos se convierten en tareas con dueño y fecha.
- **Pausa y reanudación:** cuando un agente emite `decision.requested`, su tarea queda en `awaiting`. Al llegar `decision.resolved`, el orquestador reanuda con la instrucción humana como contexto.
- **Presupuesto:** límite de tokens y costo por agente, por día y por proyecto, visible en el panel. Si se rebasa, el agente se detiene y pide autorización.
- **Registro:** cada llamada al modelo queda ligada a su tarea para auditar qué se hizo, con qué contexto y a qué costo.
- **Seguridad:** las herramientas que envían algo hacia afuera (correo, mensajes, documentos al cliente) solo se ejecutan después de una decisión aprobada.

---

## 8. La oficina (`apps/vo` + `packages/office3d`)

### 8.1 Referencias

Los prototipos en `docs/referencias/` muestran el comportamiento esperado:

- `oficina-3d.html`: **dirección visual elegida.** Escena 3D low-poly con cámara orbital, vistas por sala y cámara automática.
- `oficina-2d.html`: la misma lógica en un plano 2D. Sirve como vista alternativa ligera (móvil o equipos modestos).

Ambos tienen un guion de un día completo (standup, llegada de un prospecto, kickoff, plan de trabajo, propuesta, consejo BOARDx y evaluación TEAMx) que se porta como escenario de simulación (§10).

### 8.2 Salas

El layout es **dato, no código**: `packages/office3d/layouts/default.ts` define salas, puertas, asientos y la red de pasillos. Cada oficina puede tener su propio layout.

| Sala | Uso |
|---|---|
| Dirección General | Senior Partner |
| Oficina de Partner | Partner, con sillas para visitas |
| Sala de juntas | Mesa ovalada de 12 asientos y pizarrón que muestra el título de la junta activa |
| **Oficina del socio (20% humano)** | El humano. Asientos de espera para los agentes con decisiones pendientes. Iluminación cálida |
| Laboratorio de análisis | Analistas y Diagnóstico. Pared de pantallas con gráficas vivas |
| Gestión de proyectos | Manager, con tablero kanban que refleja tareas reales |
| Piso de consultoría | Consultores y roles de soporte. **Escritorios vacíos translúcidos con "+ agente"** que muestran la capacidad de crecer |
| Lounge | Pausas (estado `idle`) |
| Recepción de clientes | Llegada y despedida de clientes |
| Motor de automatización (80%) | Bandas donde cada tarea automatizada pasa como un cubo del color del agente que la originó, con contador |

### 8.3 Personajes

- Modelos GLB low-poly con animaciones de caminar, sentarse, teclear, gesticular y estar de pie. Fuentes con licencia libre: Kenney, KayKit y Quaternius (CC0) para muebles y personajes; Mixamo para animaciones. Se guardan en `apps/vo/public/models/`.
- Cada agente tiene apariencia propia (ropa, cabello, tono de piel) definida en su archivo de `packages/agents`.
- **Aro de estado** en el piso bajo cada agente, con el color del estado (§9.2). En `awaiting`, además, un halo pulsante y un "!" sobre la cabeza.
- Nombre flotante bajo cada agente y globo de diálogo cuando habla (`agent.say`).
- **Rutas:** los agentes caminan por pasillos usando la red de nodos del layout (camino más corto), nunca atraviesan paredes. Al llegar a un asiento se sientan mirando a su escritorio, a la mesa o a la persona indicada.
- Los monitores de cada escritorio se encienden cuando su dueño está trabajando en su lugar.

### 8.4 Cámara

- Vista inicial: toda la oficina en ángulo isométrico.
- Botones de vista: General · Sala de juntas · Oficina del socio · Consultoría · Automatización.
- **Cámara automática** (activada por defecto): se acerca a la sala de juntas cuando empieza una junta y a la oficina del socio cuando llega una decisión, y vuelve a la vista general. Se desactiva sola si el usuario mueve la cámara.
- Arrastrar para girar y rueda para acercar, con límites para no perder la oficina.

### 8.5 Panel lateral y controles

- **Equipo:** lista de agentes con avatar, rol, tarea actual y estado.
- **Decisiones:** tarjetas con quién pide, qué pide, monto o compromiso, 2–4 puntos de contexto y los botones **Aprobar** / **Pedir ajustes** (este último abre un campo de nota que el agente recibe como instrucción).
- **Actividad:** bitácora en vivo, con las decisiones pendientes resaltadas.
- **Ficha del agente** (clic en un avatar): estado, tarea actual, personalidad, cola de trabajo, skills, contexto cargado, métricas del día y, si aplica, su decisión pendiente. Incluye **chat directo con el agente** (requisito de `docs/WEB.md` §5.2).
- **Barra superior:** reloj, agentes activos, tareas automatizadas hoy, decisiones pendientes y **medidor 80/20** (esfuerzo de agentes contra humano, con la meta marcada).
- **Franja de clientes:** cada cliente activo con servicio, etapa y avance.
- **Aviso flotante** cuando hay decisiones pendientes, con acceso directo a la bandeja.

---

## 9. Identidad visual de ALTEC VO

### 9.1 Base

Hereda los tokens de `packages/ui` (`CLAUDE.md`). ALTEC VO es la única superficie que usa la variante **Altec.AI** (gradiente azul a verde) en su logotipo.

- Fondo de interfaz: `--altec-black` y `--altec-dark-gray`.
- Texto: `--altec-cream`.
- Acento: `--altec-green` **`#C1FF72`**.

### 9.2 Colores de estado

El verde de marca se usa para "trabajando" porque es el estado deseado. El ámbar queda reservado para lo que necesita al humano y no se usa para nada más.

| Estado | Etiqueta | Color |
|---|---|---|
| `working` | Trabajando | `#C1FF72` (verde de marca) |
| `meeting` | En reunión | `#7FA8FF` |
| `collab` | Colaborando | `#C39BFF` |
| `awaiting` | Espera tu decisión | `#F5A524` (ámbar, uso exclusivo) |
| `idle` | En pausa | `#6B6B6B` |

### 9.3 Escena 3D

- Paleta de la oficina en neutros cálidos y cream, con negro en mobiliario técnico y el verde de marca como luz de acento (monitores, bandas del motor, bordes del motor de automatización).
- La oficina del socio con luz cálida para distinguirla.
- Sombras suaves. Nada de texturas fotorrealistas: el estilo es low-poly limpio.

---

## 10. Modo simulación (demo del 16 de octubre)

Para la reunión de socios del **16 de octubre de 2026**, ALTEC VO se presenta en modo simulación: la oficina completa, los 12 agentes y un día de trabajo con guion, **sin depender todavía del motor real**.

- El guion vive en `packages/events/scenarios/day-one.ts` y **emite los mismos `OfficeEvent`** que emitirá el motor (§4). Se porta del prototipo `oficina-3d.html`.
- Un interruptor de fuente de eventos (`EVENT_SOURCE=simulation | live`) decide si la oficina escucha el guion o Supabase Realtime.
- Controles de demo: pausa, velocidad 1× / 2× / 4× y **modo presentación** (aprueba solo las decisiones después de 10 segundos, para que la demo corra sin tocarla).
- Clientes y cifras de ejemplo, marcados como tales en pantalla.
- Acceso: `app.altec.mx` con contraseña de demo, o una ruta protegida en `apps/vo`.

---

## 11. Acceso y roles

Autenticación con Supabase Auth. Roles iniciales:

| Rol | Puede |
|---|---|
| `founder` | Todo: aprobar decisiones, configurar agentes, umbrales y layouts |
| `partner` | Ver todas las oficinas, aprobar decisiones de sus clientes |
| `consultant` | Ver su oficina, chatear con agentes, sin aprobar decisiones que comprometan a la firma |
| `viewer` | Solo mirar (inversionistas y demos) |

Las decisiones se asignan a un humano concreto. Si tiene varias oficinas, la bandeja las agrupa.

---

## 12. Fases y criterios de aceptación

### Fase 0 — Demo (antes del 16 de octubre de 2026)

- [ ] `apps/vo` creada en el monorepo con los tokens de `packages/ui`.
- [ ] Oficina 3D con las 10 salas, los 12 agentes, rutas por pasillos y animaciones básicas.
- [ ] Panel lateral (Equipo, Decisiones, Actividad), ficha del agente, KPIs y medidor 80/20.
- [ ] Escenario `day-one` portado y funcionando con el contrato de eventos real.
- [ ] Cámara automática, vistas por sala y modo presentación.
- [ ] Corre fluido en una laptop común; en celular funciona al menos la vista 2D o una vista simplificada.

### Fase 1 — ALTEC VO v1.0 (enero de 2027)

- [ ] Autenticación y roles (§11).
- [ ] `apps/engine` desplegado con Nora, Valeria y Ricardo funcionando de verdad sobre un proyecto real.
- [ ] Decisiones humanas que pausan y reanudan agentes.
- [ ] Chat directo con cada agente activo.
- [ ] Panel de proyectos activos.
- [ ] Bitácora de eventos y costos por agente.
- [ ] Integración con al menos una herramienta interna (CRM de Flow Hub o repositorio de documentos).

### Fase 2 — Expansión (2027)

- Resto del roster activado.
- Una oficina por empresa del grupo, cada una con su roster.
- Oficinas para clientes y consultores licenciados.
- Exportables y reportes (pendiente de definir, §13).

---

## 13. Pendientes por definir

Estos puntos se acuerdan después. El código debe dejarlos **configurables**, no resueltos a mano:

- Reglas y condiciones de operación de cada agente.
- Umbrales exactos de escalamiento al humano (montos, tipos de cliente, excepciones).
- Qué se exporta, en qué formato y para quién.
- Nombres definitivos de los agentes y de las oficinas.
- Integraciones concretas (CRM, calendario, correo, documentos).
- Qué ve un cliente si en el futuro se le da acceso a su propia oficina.
- Modelo comercial de ALTEC VO como producto externo.

---

*Este documento es la base de ALTEC VO. Se actualiza en cada fase. Lo que no cambia: el principio 80/20, que el humano es un paso explícito del flujo, que la oficina solo dibuja lo que el motor reporta y la identidad visual de ALTEC.*
