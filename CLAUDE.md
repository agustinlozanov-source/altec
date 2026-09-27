# ALTEC Group — Monorepo

Este repositorio contiene **todo** lo digital de ALTEC Group: el sitio corporativo, el portal del inversionista y ALTEC VO (la oficina virtual con agentes de IA). Un solo stack, un solo sistema de diseño y una sola base de código.

## Documentos fuente (en este orden de prioridad)

1. `CLAUDE.md` (este archivo): reglas comunes a todo el repositorio.
2. `docs/WEB.md`: blueprint del sitio `altec.mx` y del portal `docs.altec.mx`. Contenido, identidad visual y fases.
3. `docs/ALTEC-VO.md`: especificación de ALTEC VO (`app.altec.mx`).
4. `docs/referencias/`: prototipos HTML de la oficina virtual (`oficina-2d.html`, `oficina-3d.html`). **Son referencia visual y de comportamiento, no código a copiar.** Se reimplementan en React.

Si dos documentos se contradicen, gana el de mayor prioridad. Si la contradicción afecta contenido o identidad visual, pregunta antes de decidir.

## Estructura

```
/
├─ apps/
│  ├─ web/        → altec.mx               Next.js (App Router)  · Fase 1 del sitio
│  ├─ docs/       → docs.altec.mx          Next.js               · Portal del inversionista (Fase 2)
│  ├─ vo/         → app.altec.mx           Next.js               · ALTEC VO, la oficina virtual
│  └─ engine/     → servicio de agentes    Node + TypeScript     · Claude Agent SDK, corre como proceso continuo
├─ packages/
│  ├─ ui/         → tokens de marca, preset de Tailwind, componentes compartidos, logos e isotipo en SVG
│  ├─ db/         → esquema de base de datos, migraciones y cliente tipado (Postgres / Supabase)
│  ├─ events/     → contrato de eventos entre engine y vo (tipos + validación con zod)
│  ├─ agents/     → definición de agentes: roles, personalidad, skills, herramientas, reglas de escalamiento
│  ├─ office3d/   → escena 3D de la oficina (React Three Fiber). Solo dibuja; no contiene lógica de negocio
│  └─ config/     → tsconfig, eslint y prettier compartidos
└─ docs/
```

`apps/docs` y partes de `apps/vo` pueden no existir todavía. Créalos cuando su fase lo requiera, con esta misma estructura.

## Stack (igual para todo)

| Capa | Herramienta |
|---|---|
| Lenguaje | TypeScript en modo `strict`, en todas las apps y paquetes |
| Monorepo | pnpm workspaces + Turborepo |
| Frontend | Next.js, versión estable actual, App Router, Server Components por defecto |
| Estilos | Tailwind CSS con un preset compartido desde `packages/ui` |
| 3D | three + @react-three/fiber + @react-three/drei (solo en `apps/vo` y `packages/office3d`) |
| Base de datos y auth | Supabase (Postgres, Auth, Realtime, Storage) |
| Agentes | Claude Agent SDK (TypeScript) en `apps/engine` |
| Correo | Resend + React Email |
| Hosting | **Netlify** para `web`, `docs` y `vo` (decidido sep 2026; el blueprint proponia Vercel). Railway, Render o Fly.io para `engine` |
| Validación | zod |

No se introduce otro framework, otro lenguaje ni HTML suelto. Si algo parece requerirlo, pregunta primero.

## Identidad visual (resumen, detalle en `docs/WEB.md` §2)

| Token | Hex |
|---|---|
| `--altec-black` | `#000000` |
| `--altec-cream` | `#FFF0E4` |
| `--altec-green` | **`#C1FF72`** (verde oficial, tomado de los archivos de marca; sustituye a `#CCFF78` y `#BEFF5E` de versiones previas) |
| `--altec-dark-gray` | `#1A1A1A` |
| `--altec-mid-gray` | `#6B6B6B` |
| `--altec-white` | `#FFFFFF` |

- Los colores se definen **una sola vez** en `packages/ui` (variables CSS + preset de Tailwind). Ninguna app escribe hex de marca a mano.
- **Modo oscuro por defecto, con modo claro disponible** desde el interruptor flotante. La elección se guarda en el navegador.
-  Cada sección declara un contexto de superficie (`surface-base`, `surface-alt` o `surface-invert`, este último para portadas con imagen) y los componentes usan papeles: `bg-surface`, `text-ink`, `text-muted`, `border-line`, `bg-card`, `text-accent-ink`, `text-attention`. Un componente se escribe una vez y funciona en los dos modos y sobre las dos superficies.
- El color NO se escribe por componente. Cada sección declara un contexto de superficie (`surface-base`, `surface-alt`, o `surface-invert` para portadas con imagen) y los componentes usan papeles: `bg-surface`, `text-ink`, `text-muted`, `border-line`, `bg-card`, `text-accent-ink`.
- **Sin cream en las superficies.** En oscuro alternan `#0e0f11` y `#18191b`; en claro, blanco y `#f2f3ef`. El cream solo sobrevive dentro del propio logotipo.
- Los tokens semánticos llevan su color literal en cada contexto. **No pueden apuntar a otra variable**: una variable que referencia a otra se resuelve donde se declara, y el valor ya resuelto es el que heredan los hijos.
- El verde y el ámbar de marca no son legibles sobre fondo claro (1.06:1 y 1.83:1). Para texto existen `--color-accent-ink` y `--color-attention`, que se oscurecen en claro hasta pasar AA. Como relleno con texto negro encima, los de marca se usan igual en ambos modos.
- Sin gradientes, excepto la variante **Altec.AI** (gradiente azul a verde), reservada para ALTEC VO y productos de IA.
- **La identidad de marca aplica al dashboard, no al interior de la escena 3D.** La oficina de ALTEC VO usa el tema `studio` (el del prototipo) por defecto. Su color, sus medidas y sus ritmos viven en `packages/office3d/src/themes` y son configurables: quien quiera otra apariencia escribe otro tema, sin tocar un componente. El tema `altec` existe como alternativa vestida con la marca.
- Tipografía: **Barlow** en todo —titulares enormes en mayúsculas, interfaz y texto— y **JetBrains Mono** para datos y etiquetas. Se declara en un solo lugar (`packages/ui/src/fonts.ts`). Open Sans es la fuente del logotipo, pero el logotipo viaja como imagen: la web no hereda su tipo.


## Agentes: reales contra puestos de relleno

El roster (`packages/agents`) marca cada agente con `status`. **`real`** es un agente con personalidad, voz, reglas de escalamiento y límites trabajados, que puede hablar por la firma. **`placeholder`** es un puesto esbozado para que la oficina no se vea vacía en la demo; se reemplaza cuando le toque su turno.

`buildSystemPrompt()` **rechaza** los puestos de relleno: soltarlos a hablar con inversionistas sería improvisar en nombre de la firma.

**La separación que no se debe romper.** La personalidad de un agente es pública y vive en `packages/agents`, porque la consume la escena 3D en el navegador. El expediente de ALTEC —cap table, punto de equilibrio, monto de la ronda— es confidencial y vive en `apps/web/lib/camila/prompt.ts`, marcado con `import "server-only"`. El contexto final se arma juntando los dos **en el servidor**. Si alguien importa el expediente desde un componente de cliente, el build falla; está verificado.

Dar de alta un agente real nuevo es una sola cosa: escribir su definición en el roster con `status: "real"`. No hay que duplicar el expediente ni tocar las rutas.

## Convenciones

- **Contenido** en español de México. **Código** (nombres de variables, funciones, archivos, commits) en inglés.
- Todas las apps quedan listas para i18n (`es-MX` primario, `en` después), sin traducir todavía.
- Mobile-first. Breakpoints: 320 / 768 / 1024 / 1440.
- Accesibilidad: foco visible, contraste AA y `prefers-reduced-motion` respetado (también en la escena 3D).
- Secretos solo en variables de entorno. Nunca en el repositorio.
- Cada app tiene su propio `README.md` con cómo correrla y desplegarla.

## Comandos esperados

```
pnpm install
pnpm dev --filter web      # sitio
pnpm dev --filter vo       # oficina virtual
pnpm dev --filter engine   # motor de agentes
pnpm build                 # todo, vía Turborepo
pnpm lint && pnpm typecheck
```

## Prioridades de calendario

1. **Antes del 16 de octubre de 2026:** Fase 1 del sitio (`docs/WEB.md` §8) y la **demo de ALTEC VO en modo simulación** (`docs/ALTEC-VO.md` §10 y §12, Fase 0).
2. Noviembre y diciembre de 2026: Fase 2 del sitio y el portal del inversionista.
3. Enero de 2027: ALTEC VO v1.0 con agentes reales.

Cuando haya que elegir, el sitio Fase 1 va primero. La demo de VO usa los mismos componentes y tokens, así que no se construye nada dos veces.
