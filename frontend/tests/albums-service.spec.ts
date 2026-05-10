import { describe, it, expect, vi } from 'vitest';

import { AlbumsService } from '../src/services/albums-service.js';
import { ApiClient, ApiError } from '../src/services/api-client.js';
import type { ApiAlbum, ApiPhoto } from '../src/models/api-types.js';
import type { Album } from '../src/models/types.js';

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('AlbumsService', () => {
  describe('loadAlbums', () => {
    it('returns API albums when the backend responds', async () => {
      const apiAlbums: ApiAlbum[] = [
        { id: 1, title: 'Highland Edges', date: '14 March 2026', coverImg: 'https://cdn.test/a1', photoCount: 3 },
      ];
      const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(apiAlbums));
      const service = new AlbumsService(new ApiClient({ baseUrl: 'http://api.test', fetchImpl }));

      const result = await service.loadAlbums();

      expect(result.usingDemoData).toBe(false);
      expect(result.albums).toHaveLength(1);
      expect(result.albums[0]!.title).toBe('Highland Edges');
    });

    it('falls back to seed albums on a network error', async () => {
      const fetchImpl = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));
      const service = new AlbumsService(new ApiClient({ baseUrl: 'http://api.test', fetchImpl }));

      const result = await service.loadAlbums();

      expect(result.usingDemoData).toBe(true);
      expect(result.albums.length).toBeGreaterThan(0);
    });

    it('propagates real HTTP errors (does NOT fall back on a 500)', async () => {
      const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ error: 'boom' }, { status: 500 }));
      const service = new AlbumsService(new ApiClient({ baseUrl: 'http://api.test', fetchImpl }));

      await expect(service.loadAlbums()).rejects.toBeInstanceOf(ApiError);
    });
  });

  describe('loadAlbumPhotos', () => {
    it('returns bundled photos when the album already has them (demo data)', async () => {
      const fetchImpl = vi.fn();
      const service = new AlbumsService(new ApiClient({ baseUrl: 'http://api.test', fetchImpl }));

      const album: Album = {
        id: 'a1',
        title: 'Demo',
        date: '',
        coverImg: '',
        photos: [{ id: 'p1', img: '', thumb: '', date: '', note: '', palette: { bg: '', accent: '', mid: '' }, narrative: null }],
      };

      const photos = await service.loadAlbumPhotos(album);

      expect(photos).toHaveLength(1);
      expect(fetchImpl).not.toHaveBeenCalled();
    });

    it('fetches photos when the album is empty and id is numeric', async () => {
      const apiPhotos: ApiPhoto[] = [
        {
          id: 10,
          albumId: 1,
          img: 'https://cdn.test/full',
          thumb: 'https://cdn.test/thumb',
          note: 'note',
          date: '',
          storySpec: null,
          messages: [],
        },
      ];
      const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(apiPhotos));
      const service = new AlbumsService(new ApiClient({ baseUrl: 'http://api.test', fetchImpl }));

      const album: Album = { id: '1', title: '', date: '', coverImg: '', photos: [] };

      const photos = await service.loadAlbumPhotos(album);

      expect(fetchImpl.mock.calls[0]![0]).toBe('http://api.test/api/albums/1/photos');
      expect(photos).toHaveLength(1);
      expect(photos[0]!.id).toBe('10');
    });

    it('returns empty array when album has non-numeric id (demo album with empty photos)', async () => {
      const fetchImpl = vi.fn();
      const service = new AlbumsService(new ApiClient({ baseUrl: 'http://api.test', fetchImpl }));

      const album: Album = { id: 'demo-album', title: '', date: '', coverImg: '', photos: [] };

      const photos = await service.loadAlbumPhotos(album);

      expect(photos).toEqual([]);
      expect(fetchImpl).not.toHaveBeenCalled();
    });
  });

  describe('submitPhoto', () => {
    it('strips the data-URL prefix and POSTs the base64 payload', async () => {
      const apiPhoto: ApiPhoto = {
        id: 99,
        albumId: 1,
        img: 'https://cdn.test/full',
        thumb: 'https://cdn.test/thumb',
        note: 'A note long enough.',
        date: '10 May 2026',
        storySpec: null,
        messages: [],
      };
      const fetchImpl = vi.fn().mockResolvedValue(jsonResponse(apiPhoto, { status: 201 }));
      const service = new AlbumsService(new ApiClient({ baseUrl: 'http://api.test', fetchImpl }));

      await service.submitPhoto(
        { imageUrl: 'data:image/jpeg;base64,ABCDEFG', note: 'A note long enough.' },
        1,
        'contemplative',
      );

      const [, init] = fetchImpl.mock.calls[0]!;
      const body = JSON.parse(init!.body as string) as { imageBase64: string; albumId: number };
      expect(body.imageBase64).toBe('ABCDEFG');
      expect(body.albumId).toBe(1);
    });

    it('rejects when given a non-data URL (uploads must be local files)', async () => {
      const fetchImpl = vi.fn();
      const service = new AlbumsService(new ApiClient({ baseUrl: 'http://api.test', fetchImpl }));

      await expect(
        service.submitPhoto({ imageUrl: 'https://example.com/foo.jpg', note: 'a' }, 1, 'm'),
      ).rejects.toThrow(/data: URL/);
      expect(fetchImpl).not.toHaveBeenCalled();
    });

    it('rejects when there is no image to submit', async () => {
      const fetchImpl = vi.fn();
      const service = new AlbumsService(new ApiClient({ baseUrl: 'http://api.test', fetchImpl }));

      await expect(service.submitPhoto({ imageUrl: null, note: 'a' }, 1, 'm')).rejects.toThrow(
        /without an image/,
      );
    });
  });
});
