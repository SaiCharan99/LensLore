import { ApiClient, ApiError } from './api-client.js';
import { toAlbum, toPhoto } from './api-mappers.js';
import { SEED_ALBUMS } from './demo-data.js';
import type { Album, Photo, SubmitData } from '../models/types.js';

/**
 * Coordinates the API client with the frontend's view-model needs.
 *
 * The screens deal in `Album`/`Photo` domain types; this service handles all
 * shape conversion, lazy photo hydration, and graceful degradation when the
 * backend isn't reachable (so `npm run dev` works standalone).
 */
export class AlbumsService {
  constructor(private readonly api: ApiClient = new ApiClient()) {}

  /**
   * Fetch all albums. If the backend can't be reached at all (network error,
   * not a 4xx/5xx response), fall back to seeded demo data so the UI stays
   * functional in offline dev. A real 4xx/5xx is propagated.
   */
  async loadAlbums(): Promise<{ albums: Album[]; usingDemoData: boolean }> {
    try {
      const apiAlbums = await this.api.listAlbums();
      return {
        albums: apiAlbums.map((a) => toAlbum(a)),
        usingDemoData: false,
      };
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      // Network / CORS / parse error — backend likely not running.
      return { albums: SEED_ALBUMS, usingDemoData: true };
    }
  }

  /**
   * Fetch the photos for a specific album. When the album was loaded from
   * demo data, returns its bundled photos directly without an API round-trip.
   */
  async loadAlbumPhotos(album: Album): Promise<Photo[]> {
    if (album.photos.length > 0) {
      return album.photos;
    }

    const numericId = Number(album.id);
    if (!Number.isFinite(numericId)) {
      // Demo album with non-numeric id — nothing to fetch.
      return [];
    }

    try {
      const apiPhotos = await this.api.listAlbumPhotos(numericId);
      return apiPhotos.map(toPhoto);
    } catch {
      return [];
    }
  }

  /**
   * Submit a new photo: encode the image, POST to the API, return the
   * resulting domain `Photo` ready for display.
   */
  async submitPhoto(data: SubmitData, albumId: number, mood: string): Promise<Photo> {
    if (data.imageUrl === null) {
      throw new Error('Cannot submit a photo without an image.');
    }

    const imageBase64 = await dataUrlOrUrlToBase64(data.imageUrl);

    const apiPhoto = await this.api.createPhoto({
      imageBase64,
      note: data.note,
      mood,
      albumId,
    });

    return toPhoto(apiPhoto);
  }
}

/**
 * Strip the data-URL prefix to get raw base64 the API expects.
 * If passed a regular URL (not a data URL), throws — uploads must be local files.
 */
async function dataUrlOrUrlToBase64(input: string): Promise<string> {
  if (input.startsWith('data:')) {
    const comma = input.indexOf(',');
    if (comma === -1) {
      throw new Error('Malformed data URL.');
    }
    return input.slice(comma + 1);
  }
  throw new Error('Photo upload requires a data: URL (local file). Got an http(s) URL instead.');
}
