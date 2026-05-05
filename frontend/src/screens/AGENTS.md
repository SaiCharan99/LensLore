# Screens — Agent Orientation

Each file in this directory is a full-page Aurelia 2 custom element. They are the four screens of the app.

---

## Screen inventory

| File | Element name | State key | What it does |
|------|-------------|-----------|-------------|
| `upload-screen.ts` | `<upload-screen>` | `'upload'` | Drag-and-drop photo upload + freewrite note textarea + "Uncover the Story" CTA |
| `albums-screen.ts` | `<albums-screen>` | `'albums'` | Grid of album cards — each shows 3 stacked photos with a count badge and tilt-spread on hover |
| `album-detail-screen.ts` | `<album-detail-screen>` | `'album-detail'` | Photo thumbnail grid for one album — hover reveals note preview + date badge |
| `cinematic-story-page.ts` | `<cinematic-story-page>` | `'story'` / `'photo-story'` | Full-page dark cinematic spread — photo bleed + AI-designed typography + 6 layout variants |

---

## Navigation flow

```
upload-screen
  └─► cinematic-story-page  (on submit — new journal entry)
         └─► [close] → upload-screen

upload-screen  ──► albums-screen (nav tab)
                     └─► album-detail-screen (click album card)
                               └─► cinematic-story-page (click photo tile)
                                       └─► [close] → album-detail-screen
```

The navigation state machine is in `../app-root.ts`. Screens do not navigate themselves — they call the `onNavigate` / `onBack` / `onOpenPhoto` callbacks passed in as `@bindable()` props.

---

## Shared dependencies

All screens import and list as `dependencies`:
- `LlTopNav` — sticky nav bar
- `LlRule` — decorative divider

`cinematic-story-page.ts` additionally uses:
- `LlMotif` — SVG decorative motif
- `LlComposingLoader` — animated "Composing…" fullscreen overlay
- `LlFullscreenPhoto` — fullscreen photo overlay with image-colour bleed

---

## Adding a new screen

1. Create `my-screen.ts` here
2. Add `<my-screen if.bind="screen === 'my-screen'">` in `../app-root.ts`
3. Add `'my-screen'` to the `AppScreen` union in `../models/types.ts`
4. Add CSS in `../styles/global.css`
5. Write tests in `../../tests/my-screen.spec.ts`
6. `npx tsc --noEmit` + `npm test` must both pass

---

## cinematic-story-page — layout variants

The `spec.layout` field (from `DesignSpec`) selects one of 6 `<template if.bind="...">` blocks:

| Layout | Description |
|--------|-------------|
| `centered-stacked` | Photo top, content centred below with large title |
| `asymmetric-left` | 2-col: motif + date left, title + caption right |
| `asymmetric-right` | 2-col: title + caption left, motif + date right |
| `vertical-rule` | Date in rotated vertical text, 1px rule, content right |
| `minimal-corner` | 2-col: title + motif left, caption right |
| `frame-bordered` | Single centred panel with corner-dot border |

To add a new layout: add a new `<template if.bind="spec.layout === 'my-layout'">` block, add the value to the `LayoutStyle` union in `../models/types.ts`, and add it to `DESIGN_PRESETS` options in `../services/demo-data.ts`.

---

## Image-colour bleed (cinematic-story-page + ll-fullscreen-photo)

```html
<!-- Blurred duplicate of the same image — colours extend outward from photo edges -->
<img class="photo-bleed__bg" src.bind="photo.img" aria-hidden="true" />
```

CSS:
```css
.photo-bleed__bg {
  position: absolute;
  top: -20%; left: -10%;
  width: 120%; height: 140%;
  filter: blur(60px) saturate(1.35) brightness(0.85);
  transform: scale(1.05);
}
```

A `radial-gradient` vignette on `.photo-bleed__vignette` fades the bleed into the page background colour further out. Both values (`bgColor`) come from `sampleImageColors()` in `../services/image-colors.ts`.
