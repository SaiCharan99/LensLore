# Services — Agent Orientation

Pure TypeScript modules with no Aurelia dependencies. Can be imported anywhere.

---

## demo-data.ts

Seeded data for Phase 1 (no backend needed).

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `SEED_ALBUMS` | `Album[]` | 3 albums: Highland Edges (3 photos), Garden Watch (2), Coastal Light (2) |
| `DESIGN_PRESETS` | array | 7 pre-built `DesignSpec` objects, one per photo in the seed data |
| `pickPreset(photoId, idx?)` | function | Returns a preset — by numeric index if given, otherwise by stable hash of `photoId` |

### When to replace with API calls

When Phase 2 (backend) is ready:
- Replace `SEED_ALBUMS` usage in `app-root.ts` with `GET /api/albums`
- Replace `pickPreset()` usage in `cinematic-story-page.ts` with the actual `DesignSpec` returned by `POST /api/photos`

---

## image-colors.ts

Canvas-based dominant colour sampler. Used by `cinematic-story-page.ts` to derive the page background from the photo itself.

### Export

```typescript
async function sampleImageColors(src: string): Promise<ImageColors | null>
```

### How it works

1. Creates a 32×32 canvas and draws the image into it
2. Reads pixel data for 3 horizontal bands (top, mid, bottom)
3. Averages R, G, B for each band
4. Returns `{ top, mid, bot, topSoft, botSoft, base }` — `base` is the mid region darkened by 72% (`k=0.28`), used as the cinematic page background

Returns `null` on CORS failure or canvas unavailability (crossOrigin images from external CDNs may fail silently).

### Usage in cinematic-story-page

```typescript
this.imageColors = await sampleImageColors(this.photo.img).catch(() => null);
// Falls back to spec.palette.bg if null
const bg = this.imageColors?.base ?? this.spec.palette.bg;
```

---

## Adding a new service

1. Create `my-service.ts` here
2. Export plain functions or a class (no Aurelia DI needed for simple services)
3. If it needs Aurelia DI (e.g., `IEventAggregator`), use `resolve()` from `aurelia`
4. Write tests in `../../tests/my-service.spec.ts`
