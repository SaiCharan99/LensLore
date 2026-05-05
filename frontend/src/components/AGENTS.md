# Components — Agent Orientation

Shared Aurelia 2 custom elements, all prefixed `ll-` (LensLore). Import and add to `dependencies: []` in any screen that uses them.

---

## Component inventory

| File | Element | Bindables | Purpose |
|------|---------|-----------|---------|
| `ll-logo.ts` | `<ll-logo>` | `color`, `on-click` | SVG lens logo (3 concentric circles + crosshairs). Click is optional. |
| `ll-rule.ts` | `<ll-rule>` | — | Decorative dot-and-line divider matching the design system |
| `ll-top-nav.ts` | `<ll-top-nav>` | `accent`, `active-tab`, `on-navigate` | Sticky nav — Journal / Albums / + New Entry. Calls `onNavigate(tab)` on click. |
| `ll-motif.ts` | `<ll-motif>` | `kind`, `color` | One of 7 SVG decorative motifs; used on the cinematic story page |
| `ll-composing-loader.ts` | `<ll-composing-loader>` | `accent` | Fullscreen `#0a0a0a` overlay with rotating poetic phrases and animated lens icon. Shown while AI spec is being generated (1.8s minimum). |
| `ll-fullscreen-photo.ts` | `<ll-fullscreen-photo>` | `src`, `bg`, `on-close` | Full-bleed photo overlay. Blurred duplicate behind for image-colour bleed at edges. Press Esc or click to close. |

---

## ll-motif — available kinds

```typescript
type MotifKind =
  | 'horizon-rule'        // horizontal line + dot centrepiece
  | 'ornamental-flourish' // wave curve + dot
  | 'rain-streaks'        // 5 diagonal lines, staggered
  | 'small-crest'         // circle + radial lines (compass rose)
  | 'thin-lines'          // 3 stacked horizontal rules, fading
  | 'tide-line'           // sine wave
  | 'storm-line'          // jagged lightning path
```

SVG output is injected via `innerhtml.bind` so the colour is applied at render time (not CSS-filtered).

---

## ll-top-nav — tab values

`active-tab` highlights the matching tab. Valid values:

| Tab to highlight | Pass as `active-tab` |
|----------------|---------------------|
| Journal / Upload | `'journal'` or `'upload'` |
| Albums or Album Detail | `'albums'` or `'album-detail'` |

The component compares both strings internally so either works.

---

## Adding a new component

1. Create `ll-mycomponent.ts` in this directory
2. Import it and add to `dependencies: [...]` in the screen(s) that use it
3. Add styles in `../styles/global.css` under a `.ll-mycomponent` selector
4. If the component has logic (intervals, DOM access), implement `ICustomElementViewModel` and use `attaching()` / `detaching()` lifecycle hooks for setup/cleanup

---

## Lifecycle hooks used

| Hook | Used in | What it does |
|------|---------|-------------|
| `attaching()` | `ll-composing-loader` | Starts dot and phrase rotation intervals |
| `detaching()` | `ll-composing-loader`, `ll-fullscreen-photo` | Clears intervals, removes keydown listener |
| `attaching()` (async) | `cinematic-story-page` (screen) | Samples image colours + resolves design spec after 1.8s |
