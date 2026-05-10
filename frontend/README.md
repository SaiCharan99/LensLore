# LensLore Frontend

Aurelia 2 + TypeScript + Vite. Four screens: Journal (upload), Albums, Album Detail, and the Cinematic Story page.

For the build spec, design rationale, and component inventory, see [AGENTS.md](AGENTS.md).

## Prerequisites

- Node.js 20+
- npm 10+

## Run

```bash
npm install
npm run dev          # http://localhost:3000
```

The dev server seeds demo data so all four screens are navigable without the backend running.

## Build, test, typecheck

```bash
npm run build        # production bundle → dist/
npm test             # Vitest (21 tests)
npm run coverage     # coverage report
npm run typecheck    # tsc --noEmit
```

## Layout

```
src/
├── main.ts                  Aurelia bootstrap
├── app-root.ts              Shell + router; wires AlbumsService into screens
├── components/              Reusable UI (ll-logo, ll-rule, ll-top-nav, ll-motif, etc.)
├── screens/                 One folder per route (upload, albums, album-detail, story)
├── services/
│   ├── api-client.ts        Typed fetch wrapper for the Symfony API (6 endpoints)
│   ├── api-mappers.ts       Convert backend wire types → frontend domain types
│   ├── albums-service.ts    Coordinates the API client; falls back to demo on offline dev
│   ├── demo-data.ts         Seeded albums for offline / first-run dev
│   └── image-colors.ts      Canvas-based dominant-colour sampling
└── models/
    ├── types.ts             Domain types — DesignSpec, Album, Photo
    └── api-types.ts         Wire-format types from the Symfony API
```

## Backend wiring

`app-root.attached()` calls `AlbumsService.loadAlbums()`, which hits `GET /api/albums` on the Symfony backend (URL from `VITE_API_BASE_URL`). If the backend isn't reachable (e.g. you haven't started `symfony serve`), the service silently falls back to seeded demo data so the UI keeps working — `usingDemoData` flips to `true` in that case.

To run with the real backend:

```bash
cp .env.example .env.local        # set VITE_API_BASE_URL to your Symfony URL
# In another terminal: cd ../backend && symfony serve
npm run dev
```

## Notes worth knowing

- **TC39 decorators.** Aurelia 2 RC.1 uses TC39 Stage 3 decorators, NOT `experimentalDecorators`. `tsconfig.json` must keep `experimentalDecorators` off.
- **Vite esbuild target.** [`vite.config.ts`](vite.config.ts) sets `esbuild.target: 'es2022'` so dev mode transpiles decorators (without it, dev mode passes them as raw browser syntax and the page goes blank in browsers without TC39 decorator support).
- **Image-colour bleed.** The signature effect on the story page is in [`src/screens/cinematic-story-page/`](src/screens/cinematic-story-page/) — blurred upscaled copy of the same image, `filter: blur(60px) saturate(1.35) brightness(0.85)`, with canvas-sampled dominant colours from [`src/services/image-colors.ts`](src/services/image-colors.ts).
- **Reduced motion.** All animations are gated behind `prefers-reduced-motion: no-preference` media queries.
