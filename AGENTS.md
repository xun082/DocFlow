# AGENTS.md

## Validation (Monorepo)

Before considering work complete, run:

```bash
pnpm type-check
```

Note: Project runs continuously; do not use `pnpm dev`.

## Conventions

- Next.js App Router for routing only; no API routes.
- Global components: `components/` ; Page-level: `app/[route]/_components/`
- Utilities: `utils/`
- Avoid `useMemo`/`useCallback` unless necessary.
