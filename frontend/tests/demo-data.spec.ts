import { describe, it, expect } from 'vitest';
import { SEED_ALBUMS, DESIGN_PRESETS, pickPreset } from '../src/services/demo-data.js';

describe('SEED_ALBUMS', () => {
  it('has three albums', () => {
    expect(SEED_ALBUMS).toHaveLength(3);
  });

  it('each album has required fields', () => {
    for (const album of SEED_ALBUMS) {
      expect(album.id).toBeTruthy();
      expect(album.title).toBeTruthy();
      expect(album.date).toBeTruthy();
      expect(album.coverImg).toBeTruthy();
      expect(album.photos.length).toBeGreaterThan(0);
    }
  });

  it('each photo has required fields', () => {
    for (const album of SEED_ALBUMS) {
      for (const photo of album.photos) {
        expect(photo.id).toBeTruthy();
        expect(photo.img).toBeTruthy();
        expect(photo.thumb).toBeTruthy();
        expect(photo.date).toBeTruthy();
        expect(photo.note).toBeTruthy();
        expect(photo.palette).toBeTruthy();
      }
    }
  });

  it('has 7 photos total across all albums', () => {
    const total = SEED_ALBUMS.reduce((acc, a) => acc + a.photos.length, 0);
    expect(total).toBe(7);
  });
});

describe('DESIGN_PRESETS', () => {
  it('has 7 presets', () => {
    expect(DESIGN_PRESETS).toHaveLength(7);
  });

  it('each preset has required fields', () => {
    for (const preset of DESIGN_PRESETS) {
      expect(preset.palette).toBeTruthy();
      expect(preset.layout).toBeTruthy();
      expect(preset.headingFont).toBeTruthy();
      expect(preset.motif).toBeTruthy();
      expect(preset.title).toBeTruthy();
    }
  });
});

describe('pickPreset', () => {
  it('returns a preset by numeric index', () => {
    const p = pickPreset('any', 2);
    expect(p).toBe(DESIGN_PRESETS[2]);
  });

  it('wraps index around preset count', () => {
    const p = pickPreset('any', 14);
    expect(p).toBe(DESIGN_PRESETS[14 % DESIGN_PRESETS.length]);
  });

  it('returns a deterministic preset for the same photo ID', () => {
    const a = pickPreset('p1');
    const b = pickPreset('p1');
    expect(a).toBe(b);
  });

  it('may return different presets for different photo IDs', () => {
    const results = new Set(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'].map(id => pickPreset(id).title));
    expect(results.size).toBeGreaterThan(1);
  });
});
