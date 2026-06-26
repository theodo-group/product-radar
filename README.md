# product-radar

Compare up to 5 Profiles across 3–7 Criteria on a 0–5 scale, export the radar chart as PNG.

Deployed at https://product-radar.apoena.dev.

See [CONTEXT.md](./CONTEXT.md) for the domain glossary and [DESIGN.md](./DESIGN.md) for the goal-driven design (QFD). Architecture decisions live in [docs/adr/](./docs/adr/).

## Stack

- Vite + Vue 3 + TypeScript
- Tailwind CSS v4 + DaisyUI
- Solo, browser-local persistence via localStorage

## Develop

```bash
pnpm install
pnpm dev           # http://localhost:5173
pnpm build         # production build into ./dist
```

## Deploy

Every push to `main` triggers two independent deployments:

- **Coolify** (primary) — picked up at https://platform.apoena.dev and served at https://product-radar.apoena.dev. The Dockerfile builds the SPA and serves it through nginx on port 80, with `try_files … /index.html` as the history-mode SPA fallback.
- **GitHub Pages** — `.github/workflows/deploy-pages.yml` builds with pnpm and publishes `dist/`, copying `index.html` to `404.html` as the SPA fallback.
