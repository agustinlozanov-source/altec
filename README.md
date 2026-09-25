# ALTEC Group — Monorepo

Todo lo digital de ALTEC Group. Las reglas del repositorio estan en
[`CLAUDE.md`](./CLAUDE.md); el blueprint del sitio en [`docs/WEB.md`](./docs/WEB.md)
y la especificacion de la oficina virtual en [`docs/ALTEC-VO.md`](./docs/ALTEC-VO.md).

## Requisitos

- Node 20 o superior (probado con 24)
- pnpm 11

## Arrancar

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev --filter web      # http://localhost:3000
```

## Comandos

| Comando | Que hace |
|---|---|
| `pnpm dev --filter web` | Sitio corporativo en desarrollo |
| `pnpm build` | Construye todo via Turborepo |
| `pnpm lint` | Linter en todos los paquetes |
| `pnpm typecheck` | TypeScript en modo strict |
| `pnpm format` | Prettier sobre todo el repositorio |

## Estructura actual

```
apps/
  web/        altec.mx — Next.js 16, App Router. Fase 1: Home, Nosotros, Contacto
packages/
  ui/         tokens de marca, tipografia y componentes compartidos
  config/     tsconfig, prettier compartidos
docs/         documentos fuente y prototipos de referencia
```

`apps/docs`, `apps/vo`, `apps/engine` y el resto de `packages/` se crean cuando
su fase lo requiera (ver `CLAUDE.md`).

## Marca

Los colores, la tipografia y los breakpoints viven **solo** en
`packages/ui/src/styles/theme.css`. Ninguna app escribe hex de marca a mano.
Los logos van en `packages/ui/brand/`.
