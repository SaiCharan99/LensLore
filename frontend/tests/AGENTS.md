# Tests — Agent Orientation

Vitest 2. Run with `npm test` from the `frontend/` directory. Must be **21/21 passing** before any commit.

---

## Run commands

```bash
# Run all tests once
npm test

# Watch mode (re-runs on file save)
npx vitest

# Coverage report
npm run coverage

# Run a single test file
npx vitest run tests/upload-screen.spec.ts
```

---

## Test inventory

| File | Tests | What it covers |
|------|-------|---------------|
| `setup.ts` | — | JSDOM environment bootstrap (runs before all tests) |
| `demo-data.spec.ts` | 10 | Album/photo shape, DESIGN_PRESETS count, `pickPreset()` determinism and wrapping |
| `upload-screen.spec.ts` | 7 | `canSubmit` logic, `handleSubmit`, `handleDemo`, no-op when not ready |
| `image-colors.spec.ts` | 4 | Canvas null handling, `ImageColors` shape, `darken` math (200 × 0.28 = 56) |

---

## Testing philosophy

- **Logic tests only** — test the TypeScript class methods directly (no DOM/Aurelia rendering needed for Phase 1 tests)
- Mock browser APIs (`Image`, `canvas`) using `vi.fn()` and `vi.spyOn()`
- Do not use real network calls — mock all external image loads
- Restore mocks in `afterEach` with `vi.restoreAllMocks()`

---

## Writing a new test

```typescript
import { describe, it, expect, vi, afterEach } from 'vitest';
import { MyScreen } from '../src/screens/my-screen.js';   // note: .js extension

describe('MyScreen', () => {
  it('does the thing', () => {
    const screen = new MyScreen();
    screen.someProp = 'value';
    expect(screen.computedThing).toBe('expected');
  });
});
```

Key rules:
- Import paths need `.js` extension (ESM bundler resolution)
- Instantiate classes directly — `new UploadScreen()` — no Aurelia container needed for unit tests
- Use `vi.fn()` for callback props: `screen.onSubmit = vi.fn()`
- `@bindable()` props are just regular class properties — assign them directly in tests

---

## JSDOM limitations (known)

- `HTMLImageElement.onerror` does not fire for invalid URLs in JSDOM — mock `globalThis.Image` instead
- `canvas.getContext('2d')` returns `null` in JSDOM — mock `document.createElement` for canvas tests
- `URL.createObjectURL` is not implemented — mock it with `vi.fn().mockReturnValue('blob:test')` if needed

---

## Adding tests for Phase 2+ features

When the Symfony backend is wired in, add integration-style tests:
- Mock `fetch` with `vi.fn()` for API call tests
- Test the service layer (the TypeScript service that wraps `fetch`) independently of Aurelia components
- Keep component tests focused on UI logic, not network behaviour
