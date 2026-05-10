import { describe, it, expect } from 'vitest';

import { toAlbum, toPhoto } from '../src/services/api-mappers.js';
import type { ApiAlbum, ApiPhoto } from '../src/models/api-types.js';

describe('api-mappers', () => {
  describe('toPhoto', () => {
    it('pulls palette and narrative from storySpec when present', () => {
      const api: ApiPhoto = {
        id: 7,
        albumId: 1,
        img: 'https://cdn.test/full',
        thumb: 'https://cdn.test/thumb',
        note: 'Original note.',
        date: '10 May 2026',
        storySpec: {
          palette: { bg: '#1a1f2e', fg: '#F5EFE4', accent: '#7a9fc4', muted: 'rgba(245,239,228,0.78)' },
          layout: 'centered-stacked',
          headingFont: 'Playfair Display',
          motif: 'horizon-rule',
          title: 'The Ridge at Dawn',
          caption: 'Cloud inversion below, silence above.',
          mood: 'contemplative',
        },
        messages: [],
      };

      const photo = toPhoto(api);

      expect(photo.id).toBe('7');
      expect(photo.palette).toEqual({
        bg: '#1a1f2e',
        accent: '#7a9fc4',
        mid: 'rgba(245,239,228,0.78)',
      });
      expect(photo.narrative).toBe('Cloud inversion below, silence above.');
    });

    it('falls back to a neutral palette and null narrative when storySpec is null', () => {
      const api: ApiPhoto = {
        id: 8,
        albumId: 1,
        img: 'https://cdn.test/full',
        thumb: 'https://cdn.test/thumb',
        note: 'No story yet.',
        date: '10 May 2026',
        storySpec: null,
        messages: [],
      };

      const photo = toPhoto(api);

      expect(photo.palette.bg).toMatch(/^#/);
      expect(photo.palette.accent).toMatch(/^#/);
      expect(photo.narrative).toBeNull();
    });

    it('stringifies the numeric id (frontend domain ids are strings)', () => {
      const api: ApiPhoto = {
        id: 999,
        albumId: 1,
        img: '',
        thumb: '',
        note: '',
        date: '',
        storySpec: null,
        messages: [],
      };

      expect(toPhoto(api).id).toBe('999');
    });
  });

  describe('toAlbum', () => {
    it('maps fields and accepts optional photos', () => {
      const api: ApiAlbum = {
        id: 5,
        title: 'Coastal Light',
        date: 'February 2026',
        coverImg: 'https://cdn.test/cover',
        photoCount: 2,
      };

      const album = toAlbum(api);

      expect(album).toMatchObject({
        id: '5',
        title: 'Coastal Light',
        date: 'February 2026',
        coverImg: 'https://cdn.test/cover',
        photos: [],
      });
    });

    it('uses fallback cover when the API returns null', () => {
      const api: ApiAlbum = {
        id: 5,
        title: 'Untitled',
        date: '',
        coverImg: null,
        photoCount: 0,
      };

      expect(toAlbum(api).coverImg.length).toBeGreaterThan(0);
    });
  });
});
