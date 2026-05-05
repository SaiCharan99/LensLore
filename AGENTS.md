# LensLore — Agent Orientation

This is a **monorepo** for LensLore, a personal photo storytelling app for nature photographers. Read this file first before touching any code.

---

## What the app does

User uploads a photo → writes a few lines about the moment → the app generates a cinematic, full-page story experience where the photo's actual colours bleed outward across the screen. Stories are organised into albums.

---

## Four screens

| Screen | State value | File |
|--------|-------------|------|
| Journal (Upload) | `'upload'` | `frontend/src/screens/upload-screen.ts` |
| Albums grid | `'albums'` | `frontend/src/screens/albums-screen.ts` |
| Album detail | `'album-detail'` | `frontend/src/screens/album-detail-screen.ts` |
| Cinematic story | `'story'` / `'photo-story'` | `frontend/src/screens/cinematic-story-page.ts` |

Navigation is state-based (no URL router in Phase 1). The state machine lives in `frontend/src/app-root.ts`.

---

## Build phases & status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Aurelia 2 frontend (all 4 screens, seeded demo data) | ✅ Complete |
| 2 | Symfony 6 API (albums, photos, story endpoints) | ⬜ Not started |
| 3 | TypeScript Lambdas + Claude Sonnet 4 integration | ⬜ Not started |
| 4 | Terraform infrastructure (S3, RDS, Lambda, CloudFront) | ⬜ Not started |
| 5 | PHPUnit + Vitest tests alongside each feature | 🟡 Frontend tests done |

---

## Directory map

```
lenslore/
├── AGENTS.md            ← you are here
├── README.md            ← setup + architecture diagram
├── frontend/            ← Phase 1 (DONE) — Aurelia 2 + TypeScript
│   └── AGENTS.md        ← frontend-specific orientation
├── backend/             ← Phase 2 — Symfony 6 + PHP 8
│   └── AGENTS.md        ← backend-specific orientation
├── lambdas/             ← Phase 3 — TypeScript Lambda functions
│   └── AGENTS.md        ← lambda-specific orientation
└── infrastructure/      ← Phase 4 — Terraform
    └── AGENTS.md        ← infra-specific orientation
```

---

## Tech stack (non-negotiable)

| Layer | Technology |
|-------|-----------|
| Frontend | Aurelia 2 (`2.0.0-rc.1`) + TypeScript strict |
| Backend | Symfony 6 + PHP 8.2 |
| Lambda | TypeScript, esbuild, Node 20 |
| AI | Claude Sonnet 4 via Anthropic API (vision + text) |
| Storage | AWS S3 (images) |
| Database | PostgreSQL on AWS RDS |
| CDN | CloudFront |
| Infra | Terraform 1.9+ |
| Tests | Vitest (frontend), PHPUnit (backend) |
| Analysis | TypeScript strict / no `any`, PHPStan level 8 |

Do not substitute any of these.

---

## How to run the project right now (Phase 1 only)

```bash
cd frontend
npm install
npm run dev     # http://localhost:3000
```

All four screens work on seeded demo data. No backend required.

---

## Quality rules

- `tsc --noEmit` must pass with zero errors before committing frontend changes
- `npm test` (Vitest) must pass
- No `any` types in TypeScript
- PHPStan level 8 must pass for backend (when built)
- Every AWS resource must be defined in Terraform — no console clicks
- `prefers-reduced-motion` must be respected in all CSS animations

---

## Key design decisions already made

1. **Image-colour bleed**: A blurred, upscaled duplicate `<img>` behind the original with `filter: blur(60px) saturate(1.35) brightness(0.85)`. No synthetic gradients — the photo's own pixels extend outward.
2. **Album cards**: CSS `rotate()` + `translate()` stacked layers; hover triggers tilt-spread via class-based transitions.
3. **Cinematic story layouts**: 6 named variants (`centered-stacked`, `asymmetric-left`, `asymmetric-right`, `vertical-rule`, `minimal-corner`, `frame-bordered`). Selected by AI spec or seeded preset.
4. **Aurelia 2 decorators**: RC.1 uses TC39 Stage 3 decorators. `experimentalDecorators` must NOT be set in tsconfig — it breaks the build.
5. **Navigation**: Simple `if.bind` state machine in `app-root.ts`, no URL router in Phase 1.
