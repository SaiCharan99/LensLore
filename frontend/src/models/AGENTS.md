# Models — Agent Orientation

Pure TypeScript interfaces and types. No runtime code — only type declarations.

---

## types.ts — full inventory

### Data models

```typescript
Photo {
  id: string
  img: string        // full-res URL (Unsplash or S3 presigned)
  thumb: string      // thumbnail URL (400px wide)
  date: string       // "14 March 2026" formatted
  note: string       // the photographer's written note
  palette: { bg, accent, mid }   // fallback palette (not used on story page — DesignSpec takes over)
  narrative: string | null       // deprecated field — kept for data compat
}

Album {
  id: string
  title: string
  date: string       // "March – April 2026" range format
  coverImg: string   // URL of the cover photo
  photos: Photo[]
}
```

### AI output

```typescript
DesignSpec {
  palette: { bg, fg, accent, muted }   // all hex strings
  layout: LayoutStyle                  // one of 6 named layouts
  headingFont: HeadingFont             // 'Playfair Display' | 'EB Garamond'
  motif: MotifKind                     // one of 7 SVG motifs
  title: string                        // 3-6 word evocative title
  caption: string                      // grammar-corrected user note
  mood: string                         // 1-2 word mood descriptor
}
```

### Utility types

```typescript
SubmitData { imageUrl: string | null; note: string }  // upload-screen → app-root
AppScreen = 'upload' | 'albums' | 'album-detail' | 'story'
ImageColors { top, mid, bot, topSoft, botSoft, base }  // from canvas sampler
```

---

## Contract with the backend

When Phase 2 (Symfony) is built, the `StorySpecResponse` PHP DTO must serialize to exactly the `DesignSpec` shape above. The `LayoutStyle` and `MotifKind` union values must match the PHP enum cases.

When Phase 3 (Lambda) is built, the Lambda output must match `DesignSpec` exactly — the Symfony API passes it through without transformation.

---

## Adding new types

Add them to `types.ts`. Do not create separate files for individual types — keep them all in one place for easy cross-referencing. Export everything.
