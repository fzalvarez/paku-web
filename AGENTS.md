<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Paku Web — Agentes

## Antes de nada

Lee `paku-backend/specs/workspace.md` (contexto de los 4 repos) y `paku-backend/specs/constitution.md`.
Los repos Paku son hermanos en el workspace.

## Spec-Driven Development

- **Dominio y API**: el canon está en `paku-backend/specs/domain/` y `paku-backend/specs/api/`. No replicar lógica de negocio aquí.
- **Features de este repo**: spec → plan → tasks en `specs/` antes de implementar. Ver `specs/README.md`.
- Estado actual del repo: `specs/status.md`.

## Convenciones

- Gestor de paquetes: **pnpm**.
- Consumo de API vía capa dedicada (`lib/` / `contexts/`), no `fetch` suelto en componentes.
- TypeScript, Tailwind + shadcn/ui.
