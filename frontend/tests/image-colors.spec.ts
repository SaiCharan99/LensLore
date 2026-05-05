import { describe, it, expect, vi, afterEach } from 'vitest';
import { sampleImageColors } from '../src/services/image-colors.js';

describe('sampleImageColors', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a Promise', () => {
    const result = sampleImageColors('https://example.com/img.jpg');
    expect(result).toBeInstanceOf(Promise);
  });

  it('returns null when canvas context is unavailable', async () => {
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue(null),
      width: 0,
      height: 0,
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas as unknown as HTMLCanvasElement);

    // Simulate onload firing immediately with no-op drawImage
    const origImage = globalThis.Image;
    globalThis.Image = class {
      crossOrigin = '';
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) { queueMicrotask(() => this.onload?.()); }
    } as unknown as typeof globalThis.Image;

    const result = await sampleImageColors('https://example.com/img.jpg');
    globalThis.Image = origImage;

    expect(result).toBeNull();
  });

  it('returns ImageColors object with expected keys when canvas works', async () => {
    const pixelData = new Uint8ClampedArray(32 * 32 * 4).fill(120);
    const mockCtx = {
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({ data: pixelData }),
    };
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue(mockCtx),
      width: 0,
      height: 0,
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas as unknown as HTMLCanvasElement);

    const origImage = globalThis.Image;
    globalThis.Image = class {
      crossOrigin = '';
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) { queueMicrotask(() => this.onload?.()); }
    } as unknown as typeof globalThis.Image;

    const result = await sampleImageColors('https://example.com/img.jpg');
    globalThis.Image = origImage;

    expect(result).not.toBeNull();
    if (result) {
      expect(result).toHaveProperty('top');
      expect(result).toHaveProperty('mid');
      expect(result).toHaveProperty('bot');
      expect(result).toHaveProperty('base');
      expect(result.top).toMatch(/^rgb\(/);
      expect(result.base).toMatch(/^rgb\(/);
    }
  });

  it('colors have lower brightness than sampled values (darken applied)', async () => {
    // Fill with RGB 200, 200, 200 → base should be 200 * 0.28 = 56 rounded
    const pixelData = new Uint8ClampedArray(32 * 32 * 4);
    for (let i = 0; i < pixelData.length; i += 4) {
      pixelData[i] = 200; pixelData[i + 1] = 200; pixelData[i + 2] = 200; pixelData[i + 3] = 255;
    }
    const mockCtx = {
      drawImage: vi.fn(),
      getImageData: vi.fn().mockReturnValue({ data: pixelData }),
    };
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue(mockCtx),
      width: 0,
      height: 0,
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockCanvas as unknown as HTMLCanvasElement);

    const origImage = globalThis.Image;
    globalThis.Image = class {
      crossOrigin = '';
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_: string) { queueMicrotask(() => this.onload?.()); }
    } as unknown as typeof globalThis.Image;

    const result = await sampleImageColors('https://example.com/img.jpg');
    globalThis.Image = origImage;

    expect(result).not.toBeNull();
    if (result) {
      // base = 200 * 0.28 ≈ 56
      expect(result.base).toBe('rgb(56,56,56)');
      // mid (unprocessed) = 200
      expect(result.mid).toBe('rgb(200,200,200)');
    }
  });
});
