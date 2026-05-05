# Frontend — Agent Orientation

Aurelia 2 (`2.0.0-rc.1`) + TypeScript strict + Vite 5. **Phase 1 is complete.**

---

## Run it

```bash
# Install (only needed once)
npm install

# Dev server — http://localhost:3000, hot reload
npm run dev

# Type-check (must be zero errors)
npx tsc --noEmit

# Tests (must be 21/21 passing)
npm test

# Production build
npm run build    # output → dist/

# Coverage report
npm run coverage
```

---

## File map

```
frontend/
├── index.html                        HTML shell — mounts <app-root>
├── package.json                      deps: aurelia 2.0.0-rc.1, vite 5, vitest
├── tsconfig.json                     strict, no experimentalDecorators (important!)
├── vite.config.ts                    @aurelia/vite-plugin, test: jsdom
│
├── src/
│   ├── main.ts                       Aurelia bootstrap — Aurelia.app({ host, component })
│   ├── app-root.ts                   Navigation state machine (upload|albums|album-detail|story|photo-story)
│   │
│   ├── styles/
│   │   └── global.css                ALL styles — design tokens, animations, every component class
│   │
│   ├── models/
│   │   └── types.ts                  Interfaces: Photo, Album, DesignSpec, ImageColors, SubmitData, AppScreen
│   │
│   ├── services/
│   │   ├── demo-data.ts              SEED_ALBUMS (3 albums, 7 photos), DESIGN_PRESETS (7), pickPreset()
│   │   └── image-colors.ts           Canvas-based dominant-colour sampler → ImageColors
│   │
│   ├── components/                   Shared Aurelia custom elements (prefix ll-)
│   │   ├── ll-logo.ts                SVG lens logo with optional click handler
│   │   ├── ll-rule.ts                Dot-and-line decorative divider
│   │   ├── ll-top-nav.ts             Sticky nav — Journal / Albums / + New Entry tabs
│   │   ├── ll-motif.ts               7 SVG decorative motifs (horizon-rule, rain-streaks…)
│   │   ├── ll-composing-loader.ts    Fullscreen loader with rotating phrases ("Reading the light…")
│   │   └── ll-fullscreen-photo.ts    Full-bleed photo overlay with image-colour bleed; Esc to close
│   │
│   └── screens/
│       ├── upload-screen.ts          Journal: drag-and-drop upload + EB Garamond textarea + CTA
│       ├── albums-screen.ts          Stacked photo-pile album cards; hover tilt-spread animation
│       ├── album-detail-screen.ts    Photo thumbnail grid; hover shows note preview + date badge
│       └── cinematic-story-page.ts   6 layout variants; image-colour bleed; "Composing…" loader
│
└── tests/
    ├── setup.ts                      JSDOM environment bootstrap
    ├── demo-data.spec.ts             10 tests — albums, photos, presets, pickPreset()
    ├── upload-screen.spec.ts         7 tests — canSubmit logic, handleSubmit, handleDemo
    └── image-colors.spec.ts          4 tests — canvas colour sampling, null handling
```

---

## Aurelia 2 RC.1 — critical notes

### Decorators
RC.1 uses **TC39 Stage 3 decorators** (NOT legacy experimental decorators).  
`tsconfig.json` must NOT have `experimentalDecorators: true` — it causes TS1238/TS1240 errors.

### Component pattern
```typescript
import { customElement, bindable, ICustomElementViewModel } from '@aurelia/runtime-html';

@customElement({ name: 'my-component', template: `<div>${'$'}{title}</div>` })
export class MyComponent implements ICustomElementViewModel {
  @bindable() title = '';
  @bindable() onAction?: () => void;

  attaching(): void { /* lifecycle — like componentDidMount */ }
  detaching(): void { /* cleanup */ }
}
```

### Bootstrap (main.ts)
```typescript
import Aurelia from 'aurelia';
Aurelia.app({ host: document.querySelector('app-root') as HTMLElement, component: AppRoot }).start();
```

### Template binding syntax
| Pattern | Aurelia 2 |
|---------|-----------|
| Interpolation | `${expr}` |
| Event | `click.trigger="handler()"` |
| Two-way | `value.bind="prop"` |
| One-way | `property.bind="expr"` |
| Conditional | `if.bind="cond"` |
| List | `repeat.for="item of items"` |
| Dynamic CSS | `css="color: ${color};"` |
| DOM ref | `ref="elemRef"` |

### Dependencies — declare per component
```typescript
@customElement({ name: 'parent', template, dependencies: [ChildComponent, AnotherComponent] })
```

---

## Adding a new screen (step by step)

1. Create `src/screens/my-screen.ts` with `@customElement` + inline template
2. Import it in `app-root.ts` and add to `dependencies: [...]`
3. Add a new state value to `AppScreen` in `src/models/types.ts`
4. Add `<my-screen if.bind="screen === 'my-screen'">` in `app-root.ts` template
5. Add navigation handler in `AppRoot` class
6. Add CSS for the screen in `src/styles/global.css`
7. Write tests in `tests/my-screen.spec.ts`
8. Run `npx tsc --noEmit` and `npm test` — both must pass

---

## Adding a new shared component

1. Create `src/components/ll-mycomponent.ts`
2. Add `@bindable()` props and an inline template
3. Import and add to `dependencies: [...]` in any screen that uses it
4. Add styles in `global.css` under a clearly named selector
5. Write a test if the component has non-trivial logic

---

## Phase 2 wiring (when backend is ready)

Replace the seeded demo data calls in `app-root.ts` with API calls:
- `SEED_ALBUMS` → `GET /api/albums`
- Upload flow → `POST /api/photos` (returns story spec)
- Story page → consume the `DesignSpec` from the API response instead of `pickPreset()`

The `DesignSpec` interface in `src/models/types.ts` already matches the Lambda contract exactly — no type changes needed.

---

## Design tokens (do not change these values)

```css
--cream-bg:    #FAF7F2;   /* page background */
--cream-warm:  #F5F0E8;   /* upload zone bg */
--cream-deep:  #EDE5D8;   /* disabled states, skeleton */
--forest:      #3D6B4F;   /* primary accent — nature green */
--forest-mid:  #5A8A6A;   /* hover state */
--ink:         #2C2A25;   /* body text */
--ink-soft:    #7A7670;   /* muted text, inactive tabs */
--rule:        #D8CFC2;   /* divider lines */
--font-display: 'Playfair Display', Georgia, serif;
--font-body:    'EB Garamond', Georgia, serif;
--font-ui:      'Lato', system-ui, sans-serif;
```

Cinematic story pages use dark backgrounds (`#0f1822` range) with warm cream text (`#F5EFE4`). These come from `DESIGN_PRESETS` or the AI-generated spec — do not hardcode them into CSS.
