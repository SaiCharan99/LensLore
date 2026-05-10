import type { ApiAlbum, ApiPhoto } from '../models/api-types.js';
import type { Album, Photo } from '../models/types.js';

const FALLBACK_PALETTE = { bg: '#1a1f2e', accent: '#7a9fc4', mid: '#3a4f6e' };

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80';

/**
 * Convert a backend `ApiPhoto` into the frontend `Photo` domain type.
 * Pulls colours from `storySpec.palette` when present (the source of truth);
 * falls back to a neutral palette when no story has been generated yet.
 */
export function toPhoto(api: ApiPhoto): Photo {
  const spec = api.storySpec;

  return {
    id: String(api.id),
    img: api.img,
    thumb: api.thumb,
    date: api.date,
    note: api.note,
    palette: spec === null
      ? FALLBACK_PALETTE
      : {
          bg: spec.palette.bg,
          accent: spec.palette.accent,
          // The backend palette uses `muted`; the frontend's legacy `mid` slot
          // serves the same purpose visually (mid-tone for borders/decoration).
          mid: spec.palette.muted,
        },
    narrative: spec === null ? null : spec.caption,
  };
}

/**
 * Convert a backend `ApiAlbum` into the frontend `Album` domain type.
 * The list endpoint omits photos for performance; pass them in separately
 * once you've fetched them via `/api/albums/{id}/photos`.
 */
export function toAlbum(api: ApiAlbum, photos: Photo[] = []): Album {
  return {
    id: String(api.id),
    title: api.title,
    date: api.date,
    coverImg: api.coverImg ?? FALLBACK_COVER,
    photos,
  };
}
