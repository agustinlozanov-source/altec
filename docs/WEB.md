# ALTEC Group — Web Blueprint
## Documento base para el desarrollo de altec.mx

**Fecha:** Septiembre 2026  
**Versión:** 1.1 (verde oficial, apellidos del equipo y estructura de monorepo)  
**Propósito:** Guía completa para el equipo de desarrollo web. Contiene arquitectura, contenido, identidad visual y prioridades de construcción.

---

## 1. Arquitectura de Subdominios

| Subdominio | Función | Prioridad |
|---|---|---|
| `altec.mx` | Sitio corporativo principal | Fase 1 |
| `docs.altec.mx` | Portal del Inversionista (data room digital) | Fase 2 |
| `app.altec.mx` | ALTEC VO — Virtual Office (dashboard con agentes IA) | Fase 3 (Enero 2027) |

**Dominios alternativos a evaluar:** altec.mx (primario), alteclatam.com, altec.group, altecgroup.mx

**Nota:** Cada empresa del grupo mantiene su propio dominio (flowhub.com.mx, scalexlatam.com, avalluo.com, bostonskilling.com, photocan.com.mx). El sitio de ALTEC no reemplaza estos sitios — los conecta.

---

## 2. Identidad Visual

### 2.1 Paleta de Colores

Extraída directamente del brandbook y los logos oficiales:

| Token | Hex | Uso |
|---|---|---|
| `--altec-black` | `#000000` | Fondo principal, textos en modo claro |
| `--altec-cream` | `#FFF0E4` | Textos sobre fondo oscuro, fondo modo claro |
| `--altec-green` | `#C1FF72` | Acento principal, CTAs, isotipo (las tres diagonales). **Verde oficial**, medido directamente sobre los archivos de marca (sustituye a `#CCFF78` y `#BEFF5E` de versiones previas). |
| `--altec-dark-gray` | `#1A1A1A` | Fondos secundarios, cards |
| `--altec-mid-gray` | `#6B6B6B` | Textos secundarios, subtítulos |
| `--altec-white` | `#FFFFFF` | Fondos alternativos, contraste |

### 2.2 Tipografía

- **Headings:** La tipografía del logo es bold, itálica, grotesca/sans-serif con personalidad (similar a un custom type o una modificación de fuentes como Neue Haas Grotesk Display Bold Italic). Usar la fuente corporativa que defina el equipo de branding.
- **Body:** Sans-serif limpia. Recomendación: Inter, DM Sans o la que se alinee con el sistema.
- **Monospace (datos/código):** JetBrains Mono o similar.

### 2.3 Elementos de Marca

- **Logo principal:** "Altec" con las tres diagonales verdes (///) como acento sobre la "e". Dos versiones: sobre fondo negro (texto cream) y sobre fondo claro (texto negro).
- **Isotipo:** Las tres diagonales verdes solas. Usar como favicon y elemento decorativo.
- **Variante "Altec.AI":** Logo con ".AI" en gradiente azul-verde. Reservada para ALTEC VO y productos de inteligencia artificial.
- **Subtexto corporativo:** "ALTEC GROUP SAPI de CV" en gris, debajo del logo limpio (sin diagonales).

### 2.4 Estilo Visual

- Modo oscuro como predeterminado (fondo negro, texto cream).
- Secciones alternadas: oscuro → claro → oscuro.
- Bordes redondeados suaves en cards (8-12px).
- Los logos de las 5 empresas van en cápsulas negras redondeadas (pill shapes), como aparecen en el sales pitch.
- Sin gradientes excepto en la variante Altec.AI.
- Fotografía: profesional, corporativa pero no genérica. Priorizar fotos reales del equipo cuando estén disponibles.

---

## 3. Navegación Principal

```
[Logo Altec]  Home  |  Nosotros  |  Empresas  |  Consultoría  |  Contacto   [CTA: Portal Inversionista]
```

- **Navbar:** Fija (sticky), fondo negro semitransparente con backdrop-blur.
- **CTA derecho:** Botón verde "Portal Inversionista" → enlaza a `docs.altec.mx`.
- **Mobile:** Hamburger menu. Logo centrado. CTA visible.
- **Footer:** Logo + datos fiscales + links a empresas + redes sociales + "ALTEC GROUP SAPI de CV — CDMX, México"

---

## 4. Páginas del Sitio

---

### 4.1 HOME (`altec.mx`)

**Objetivo:** Comunicar en 10 segundos qué es ALTEC, por qué importa y qué hace diferente.

#### Hero Section
- Fondo: negro.
- Logo Altec grande (versión cream con diagonales verdes).
- Headline: **"Advisory · Learning · Technology"**
- Subheadline: "El grupo empresarial que integra consultoría, educación y tecnología para escalar PyMEs en Latinoamérica."
- CTA primario: "Conoce nuestras empresas" → scroll a sección empresas.
- CTA secundario: "Portal del Inversionista" → `docs.altec.mx`.

#### Sección: La Categoría ALT
- Fondo: cream/claro.
- Título: **"No somos una categoría existente."**
- Diagrama visual del ciclo ALT:
  - **Advisory** (consultoría estratégica, comercial, tecnológica) →
  - **Learning** (educación ejecutiva, certificaciones, eventos) →
  - **Technology** (plataformas SaaS, automatización, agentes IA) →
  - (ciclo que vuelve a Advisory)
- Texto: "ALTEC opera en la intersección de tres industrias que históricamente se venden por separado. Nosotros las integramos en un ciclo donde cada una alimenta a las demás."

#### Sección: Nuestras Empresas
- Fondo: negro.
- Grid de 5 cards (2+2+1 en desktop, stack vertical en mobile).
- Cada card:
  - Logo de la empresa (en cápsula/pill shape negra como en el sales pitch).
  - Industria en una línea.
  - Métrica principal de tracción.
  - Enlace: "Ver más →"

| Empresa | Industria | Métrica |
|---|---|---|
| **Flow Hub** | Tecnología e Inteligencia Comercial | +40 sistemas · +1,300 automatizaciones · +60 agentes IA |
| **ScaleX Latam** | Consultoría de Escalabilidad | Método propio · Libro publicado · Plataforma con 4 herramientas |
| **Avalluo / Quantía** | Valuación de Activos | +12,000 activos valuados · 32 estados · Tecnología propia |
| **Boston Skilling Center** | Educación Ejecutiva (EdTech) | Programas certificados · Alianzas académicas |
| **Photocan** | Marketing y Audiovisual | Producción de contenido · Marca y comunicación |

#### Sección: Números del Grupo
- Fondo: claro.
- Contadores animados (scroll-triggered):
  - **+12,000** activos valuados
  - **+1,300** automatizaciones creadas
  - **+60** agentes de IA construidos
  - **+40** sistemas entregados
  - **5** empresas integradas
  - **32** estados con presencia

#### Sección: BHAG (Visión a 10 Años)
- Fondo: negro.
- Texto grande, centrado, dramático:
  - **"Para 2035, ALTEC será el grupo de referencia en la categoría ALT en Latinoamérica, con presencia en 5+ países, una red de +500 consultores certificados y un portafolio de empresas que genere más de $500M MXN anuales."**

#### Footer
- Logo Altec (versión cream).
- Razón social: ALTEC GROUP SAPI de CV.
- Dirección: Reforma 445, CDMX, México.
- Links: Home | Nosotros | Empresas | Consultoría | Contacto | Portal Inversionista.
- Redes sociales (iconos).

---

### 4.2 NOSOTROS (`altec.mx/nosotros`)

**Objetivo:** Contar la historia del grupo y presentar al equipo fundador.

#### Sección: La Historia
- Timeline visual (vertical en mobile, horizontal en desktop):
  - **2018** — Se funda Avalluo en Monterrey. Primera empresa del futuro grupo.
  - **2019** — Nace Flow Hub como fábrica de software y automatizaciones.
  - **2021** — ScaleX Latam lanza su método de escalabilidad para PyMEs.
  - **2023** — Se publica el libro "Método de Escala para PyMEs Latinoamericanas".
  - **2024** — Se crea Boston Skilling Center. Photocan se integra al ecosistema.
  - **2026** — Se constituye ALTEC Group SAPI de CV. Las 5 empresas se integran bajo un holding con sede en CDMX.

#### Sección: Tesis del Grupo
- Texto en formato editorial (tipo manifiesto):
  - "Las PyMEs en Latinoamérica enfrentan tres problemas simultáneos: no saben vender bien (advisory), no actualizan sus competencias (learning) y no adoptan tecnología a tiempo (technology). Estos problemas no se resuelven uno a la vez. Se resuelven juntos."
  - "ALTEC existe porque creemos que un grupo empresarial integrado — no una sola empresa — es la estructura correcta para atacar estos tres frentes al mismo tiempo."

#### Sección: Equipo Fundador
- Grid de cards con foto + nombre + rol + bio corta.
  - **Agustín Lozano** — CEO & Founder. Creador de las 5 empresas. Experiencia en consultoría, tecnología y educación ejecutiva. Reubicación a CDMX para dirigir el grupo.
  - **Mario Moreno Cortés** — COO. Cofundador de Flow Hub y Avalluo. Operación y tecnología.
  - **Román Cantú** — CRO / Relaciones con Inversionistas. Red de contactos institucionales. Desarrollo de negocio.
  - **Gumaro Bracho** — Director de Estrategia. Apuesta estratégica del grupo. Visión de largo plazo.

#### Sección: Gobierno Corporativo
- Los tres pilares como íconos + descripción breve:
  1. **OPSP** (One Page Strategic Plan) — Plan estratégico vivo de cada empresa, revisado trimestralmente.
  2. **Launch Gate** — Sistema de validación de productos. 12 dimensiones. Nada se vende sin pasar por aquí.
  3. **Forecast** — Proyección de equipo, talento y capacidad a 12 meses.

---

### 4.3 EMPRESAS (`altec.mx/empresas`)

**Objetivo:** Presentar cada empresa con suficiente profundidad para que un inversionista o cliente entienda el portafolio.

#### Layout
- Página larga con secciones ancla para cada empresa.
- Navegación lateral sticky (desktop) con los 5 logos.

#### Por cada empresa, la misma estructura:

1. **Header:** Logo (pill shape) + nombre + tagline de una línea.
2. **Qué hace:** Párrafo de 3-4 oraciones.
3. **Industria y mercado:** A quién sirve y en qué sector.
4. **Tracción:** Métricas concretas (números reales, no proyecciones).
5. **Activos:** Qué tiene hoy (plataforma, método, libro, base de datos, etc.).
6. **Modelo de escala:** Cómo crece (SaaS, licencias, volumen, etc.).
7. **Estatus legal:** Razón social y estado de constitución.
8. **CTA:** "Visitar sitio →" (enlace al dominio propio de cada empresa).

#### Contenido por empresa:

**Flow Hub**
- Fábrica de software, CRM con IA, automatizaciones en modelo SaaS.
- Orientada a empresas que necesitan digitalizar su operación comercial.
- Escala por suscripciones recurrentes (MRR/ARR).
- Tracción: +40 sistemas creados, +1,300 automatizaciones, +60 agentes IA.
- Sectores atendidos: industrial, legal, marketing, retail, fabricantes, tecnología, apuestas online, consultoría, área médica, sector primario, agencias aduaneras, bares y restaurantes, turismo, EdTech.
- Razón social: Flow Hub Tecnología e Inteligencia Comercial S.A. de C.V. — Constituida.

**ScaleX Latam**
- Consultoría de escalabilidad. Método propio (DX21: 7 pilares × 3 lentes, 41 dimensiones, 164 sub-dimensiones).
- Libro publicado: "Método de Escala para PyMEs Latinoamericanas".
- Plataforma propietaria (app.scalexlatam.com) con 4 herramientas: SCANx, SCALEx, TEAMx, BOARDx.
- Orientada a PyMEs en Latinoamérica.
- Escala por licencias a consultores independientes.
- Por constituir nueva razón social.

**Avalluo / Quantía**
- Valuación de activos. Dictaminación pericial de activos tangibles e intangibles a nivel nacional.
- Orientada a empresas, gobierno, juzgados.
- Plataforma propietaria que reduce tiempos 200-300% vs competidores. Categorización por IA.
- Tracción: +12,000 activos valuados, alcance nacional 32 estados.
- Metodología, base de datos y tecnología propia.
- Razón social: Quantía Inteligencia en Valuación S.A. de C.V. — Constituida.

**Boston Skilling Center**
- Educación ejecutiva y capacitación empresarial.
- Programas diseñados para profesionales y equipos directivos.
- Modelo de eventos educativos semanales (fábrica de educación).
- Motor de generación de leads para todas las empresas del grupo.
- Por constituir.

**Photocan**
- Marketing y producción audiovisual.
- Creación de contenido, branding, comunicación corporativa.
- Soporte de imagen y marca para todo el grupo y clientes externos.
- Por definir integración completa al holding.

---

### 4.4 CONSULTORÍA (`altec.mx/consultoria`)

**Objetivo:** Posicionar a ALTEC como firma de consultoría seria, con método, carrera y estándares MBB-equivalentes adaptados a LATAM.

#### Sección: El Doble Rol de ALTEC
- "ALTEC es un holding que también opera como firma de consultoría. No solo administra empresas — entra en cada una, instala maquinaria comercial, transfiere know-how, acompaña hasta la independencia y pasa a la siguiente."
- Principio: **"Somos producto de nuestro propio producto."**

#### Sección: Tipos de Consultoría
- Tres columnas/cards:
  1. **Consultoría Estratégica** (ALTEC) — Definición de modelo de negocio, posicionamiento, estructura organizacional.
  2. **Consultoría Comercial** (Flow Hub) — Sistemas de venta, CRM, automatización comercial, generación de demanda.
  3. **Consultoría de Escalabilidad** (ScaleX Latam) — Diagnóstico DX21, plan de escala, implementación de pilares de crecimiento.
  4. **Consultoría Tecnológica** (ALTEC) — Ingeniería de procesos, arquitectura de sistemas, implementación de IA.

#### Sección: Toolkit de Consultoría
- **Universales (todo consultor los domina):**
  - MECE / Issue Tree — Descomposición exhaustiva y mutuamente excluyente de problemas.
  - Principio de la Pirámide — Estructuración de hallazgos y presentación de soluciones.
- **Herramientas específicas (se usan según el tipo de problema):**
  - BCG Matrix, Five Forces, Profitability Framework, Value Chain, etc.
- **Herramienta propietaria:**
  - DX21 (Diagnostic × 21) — 7 pilares × 3 lentes (Diseño, Despliegue, Desempeño), 41 dimensiones, 164 sub-dimensiones. Comparable a McKinsey 7S y BCG OrgVantage.

#### Sección: Flujo de Consultoría (3 pasos)
1. **Descomponer** — Usar MECE para convertir el problema del cliente en piezas manejables.
2. **Profundizar** — Aplicar la herramienta correcta para cada pieza (no la caja de herramientas completa).
3. **Presentar** — Estructurar la solución con el Principio de la Pirámide.

#### Sección: Carrera del Consultor
- Infografía vertical con 6 niveles:
  1. **Business Analyst** — Practicantes de universidades top (Tec, Anáhuac, Tecmilenio). Investigación y análisis.
  2. **Consultant** — Ejecución de proyectos. Dominio del toolkit.
  3. **Manager** — Liderazgo de equipos de proyecto. Relación con cliente.
  4. **Principal** — Dirección de cuentas. Desarrollo de negocio.
  5. **Partner** — P&L de una práctica o vertical. Participación en decisiones del grupo.
  6. **Senior Partner** — Dirección estratégica del grupo. Representación institucional.

#### Sección: Los 3 Marcos del Consultor
- Cards con icono + descripción:
  1. **Conducta y Comunicación** — Estándares de presentación, comunicación escrita y oral, ética profesional.
  2. **Desarrollo de Relaciones** — Construcción de confianza con clientes, networking, presencia en industria.
  3. **Conversión de Oportunidades** — Identificación de necesidades no articuladas, propuestas de valor, cierre.

---

### 4.5 CONTACTO (`altec.mx/contacto`)

**Objetivo:** Formulario limpio + datos de ubicación.

#### Contenido
- **Formulario:**
  - Nombre
  - Empresa
  - Correo electrónico
  - Teléfono (opcional)
  - Tipo de consulta: [Inversión | Consultoría | Alianza estratégica | Prensa | Otro]
  - Mensaje
  - Botón: "Enviar mensaje" (verde)

- **Datos de contacto:**
  - Dirección: Reforma 445, CDMX, México
  - Email: contacto@altec.mx
  - Mapa embebido (Google Maps)

- **Nota legal:** "ALTEC GROUP SAPI de CV. Toda la información de este sitio es confidencial y propiedad del grupo."

---

## 5. Páginas Especiales

### 5.1 Portal del Inversionista (`docs.altec.mx`)

**Acceso:** Requiere autenticación. No público.

**Funcionalidad:**
- El inversionista recibe un link con NDA digital integrado.
- Acepta NDA → accede al data room.
- Documentos NO descargables (solo visualización en browser).
- Marca de agua dinámica con el nombre del inversionista.

**Documentos disponibles:**
1. Documento Oficial del Grupo (el de 11 bloques)
2. Resumen Ejecutivo
3. Cap Table y justificación
4. Proforma financiera (cuando esté lista)
5. Launch Gate — Sistema de validación de productos
6. Estructura legal y actas constitutivas (cuando corresponda)

**Stack sugerido:** Plataforma de data room (DocSend, Notion con restricciones, o desarrollo propio con Next.js + autenticación + viewer embebido).

### 5.2 ALTEC VO — Virtual Office (`app.altec.mx`)

**Fecha objetivo:** Enero 2027 (Fase 3).

**Concepto:** Dashboard visual donde cada rol de consultoría está representado por un agente de IA. El usuario interactúa con el "office" como si entrara a una firma de consultoría virtual.

**Estructura conceptual:**
- Vista principal: oficina virtual con avatares/cards de agentes.
- Cada agente tiene un rol definido (Analista, Consultor, Estratega, etc.).
- Click en un agente → interfaz de chat/trabajo específica para su función.
- Panel lateral: proyectos activos, métricas, documentos.

**Stack sugerido:** React/Next.js + API de IA (Claude/OpenAI) + base de datos para proyectos + autenticación por roles.

**Especificación completa:** ver `docs/ALTEC-VO.md`. Ese documento manda sobre esta sección en todo lo que se refiera a ALTEC VO.

**Nota:** Este es un producto interno primero, externo después. V1.0 se enfoca en el equipo fundador.

---

## 6. Contenido Transversal

### 6.1 Microcopy y Tono de Voz
- **Tono:** Profesional pero no corporativo. Directo. Sin buzzwords vacíos.
- **Voz:** Primera persona del plural ("Nosotros creemos", "Nuestro método").
- **Evitar:** "Sinergias", "best-in-class", "soluciones integrales", "líderes en". Estas frases no dicen nada.
- **Preferir:** Números concretos, afirmaciones verificables, lenguaje que un fundador de PyME entienda sin diccionario.

### 6.2 Idioma
- **Primario:** Español (México).
- **Secundario:** Inglés (para portal del inversionista y sección About en el futuro).
- No hacer traducción completa en Fase 1. Solo preparar la arquitectura para i18n.

### 6.3 Responsiveness
- Mobile-first.
- Breakpoints: 320px (mobile) → 768px (tablet) → 1024px (desktop) → 1440px (wide).
- Navbar hamburger en mobile. Cards apiladas. Hero a pantalla completa.

---

## 7. SEO y Metadata

### 7.1 Meta Tags por Página

**Home:**
```html
<title>ALTEC Group — Advisory · Learning · Technology</title>
<meta name="description" content="Grupo empresarial que integra consultoría, educación y tecnología para escalar PyMEs en Latinoamérica. 5 empresas, un holding, una categoría nueva.">
```

**Nosotros:**
```html
<title>Nosotros — ALTEC Group</title>
<meta name="description" content="La historia, el equipo y el gobierno corporativo detrás del grupo ALTEC. Desde Monterrey hasta CDMX, construyendo la categoría ALT.">
```

**Empresas:**
```html
<title>Empresas — ALTEC Group</title>
<meta name="description" content="Flow Hub, ScaleX Latam, Avalluo, Boston Skilling Center y Photocan. El portafolio de empresas de ALTEC Group.">
```

**Consultoría:**
```html
<title>Consultoría — ALTEC Group</title>
<meta name="description" content="Consultoría estratégica, comercial y tecnológica con método propio. Toolkit MBB-grade, carrera profesional de 6 niveles, estándares de firma global.">
```

**Contacto:**
```html
<title>Contacto — ALTEC Group</title>
<meta name="description" content="Contáctanos para inversión, consultoría o alianzas estratégicas. Reforma 445, CDMX, México.">
```

### 7.2 Open Graph / Social
- Imagen OG: Logo Altec sobre fondo negro (1200×630px).
- Twitter card: summary_large_image.
- Cada página con su propia imagen OG si es posible.

### 7.3 Schema.org
- Organization markup para ALTEC Group.
- LocalBusiness para la dirección en Reforma.
- BreadcrumbList en todas las páginas.

---

## 8. Fases de Desarrollo

### Fase 1 — Antes del 16 de octubre 2026
**Páginas:** Home + Nosotros + Contacto  
**Objetivo:** Tener presencia web lista para la reunión de socios.

Entregables:
- [ ] Dominio comprado y configurado (altec.mx o alternativa)
- [ ] Deploy de Home con hero, sección empresas, números y BHAG
- [ ] Deploy de Nosotros con historia, equipo y gobierno corporativo
- [ ] Deploy de Contacto con formulario funcional
- [ ] Favicon (isotipo: tres diagonales verdes)
- [ ] Meta tags y OG básicos
- [ ] Mobile responsive
- [ ] SSL configurado

### Fase 2 — Noviembre-Diciembre 2026
**Páginas:** Empresas + Consultoría + Portal del Inversionista  
**Objetivo:** Sitio completo para levantar capital.

Entregables:
- [ ] Página de Empresas con las 5 empresas detalladas
- [ ] Página de Consultoría con toolkit, carrera y marcos
- [ ] `docs.altec.mx` con NDA digital y data room
- [ ] Integración de analytics (GA4 o Plausible)
- [ ] Versión en inglés de secciones clave (About, Contact)
- [ ] Blog o sección de noticias (opcional)

### Fase 3 — Enero 2027
**Producto:** ALTEC VO v1.0  
**Objetivo:** Dashboard interno con agentes de IA.

Entregables:
- [ ] `app.altec.mx` con autenticación
- [ ] Dashboard de oficina virtual
- [ ] Al menos 3 agentes funcionales
- [ ] Panel de proyectos activos
- [ ] Integración con herramientas internas

---

## 9. Stack Tecnológico Sugerido

| Capa | Herramienta | Razón |
|---|---|---|
| Framework | Next.js 14+ (App Router) | SSR, SEO nativo, escalabilidad |
| Estilos | Tailwind CSS | Rapidez de desarrollo, consistencia |
| Hosting | Vercel | Deploy automático, edge functions, SSL |
| CMS (si necesario) | Contentful o Sanity | Contenido editable sin deploy |
| Formularios | Resend + React Email | Emails transaccionales |
| Analytics | Plausible o GA4 | Privacy-first o estándar |
| Data Room (Fase 2) | DocSend o desarrollo propio | NDA + viewer sin descarga |
| IA (Fase 3) | Claude API / OpenAI | Agentes del Virtual Office |

**Nota:** El stack es sugerido. Si el equipo de desarrollo tiene preferencias, se adapta. Lo que no se adapta es la identidad visual ni el contenido.

**Decisión de estructura (sep 2026):** el sitio (`altec.mx`), el portal del inversionista (`docs.altec.mx`) y ALTEC VO (`app.altec.mx`) viven en **un solo monorepo** con el mismo stack (Next.js + TypeScript + Tailwind). Los tokens de marca, la tipografía y los componentes salen de un paquete compartido (`packages/ui`). La estructura completa y las reglas comunes están en `CLAUDE.md`, en la raíz del repositorio.

---

## 10. Checklist Pre-Launch (Fase 1)

- [ ] Logo en SVG optimizado (versiones dark y light)
- [ ] Isotipo como favicon (.ico + .png 192px + .png 512px)
- [ ] Fuentes corporativas cargadas (o decisión de cuáles usar)
- [ ] Textos revisados y aprobados por Agustín
- [ ] Formulario de contacto probado (envía emails correctamente)
- [ ] Responsive verificado en iPhone, Android, iPad, desktop
- [ ] Velocidad: Lighthouse >90 en Performance
- [ ] Meta tags verificados con metatags.io o similar
- [ ] Google Search Console configurado
- [ ] Redirect de www a non-www (o viceversa) configurado
- [ ] Página 404 personalizada con branding ALTEC

---

*Este documento es la base. El equipo de desarrollo puede y debe proponer mejoras de UX, microinteracciones y optimizaciones técnicas. Lo que no cambia: la información, la estructura de contenido y la identidad visual.*