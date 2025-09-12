# AGENTS.md

## Setup & Validation (pnpm)

- Install: `pnpm install`
- Build: `pnpm build`
- Type check: `pnpm type-check`
- Lint: `pnpm lint`
- Format: `pnpm format`
- Do not use: `pnpm dev` (project runs continuously)

## Conventions

- Next.js App Router for routing only; no API routes.
- Global components: `components/` ; Page-level: `app/[route]/_components/`
- Utilities: `utils/`
- Avoid `useMemo`/`useCallback` unless necessary.
