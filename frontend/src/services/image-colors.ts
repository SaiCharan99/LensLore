import type { ImageColors } from '../models/types.js';

function darken(rgb: [number, number, number], k = 0.35): [number, number, number] {
  return [Math.round(rgb[0] * k), Math.round(rgb[1] * k), Math.round(rgb[2] * k)];
}

export async function sampleImageColors(src: string): Promise<ImageColors | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const W = 32;
        const H = 32;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }

        ctx.drawImage(img, 0, 0, W, H);
        const data = ctx.getImageData(0, 0, W, H).data;

        const regions: Array<[number, number]> = [
          [0, H / 3],
          [H / 3, (2 * H) / 3],
          [(2 * H) / 3, H],
        ];

        const sampled = regions.map(([y0, y1]) => {
          let r = 0, g = 0, b = 0, n = 0;
          for (let y = Math.floor(y0); y < Math.floor(y1); y++) {
            for (let x = 0; x < W; x++) {
              const i = (y * W + x) * 4;
              r += data[i]; g += data[i + 1]; b += data[i + 2]; n++;
            }
          }
          return [Math.round(r / n), Math.round(g / n), Math.round(b / n)] as [number, number, number];
        });

        const [top, mid, bot] = sampled;
        const base = darken(mid, 0.28);

        resolve({
          top:    `rgb(${top.join(',')})`,
          mid:    `rgb(${mid.join(',')})`,
          bot:    `rgb(${bot.join(',')})`,
          topSoft:`rgba(${top.join(',')},0.55)`,
          botSoft:`rgba(${bot.join(',')},0.45)`,
          base:   `rgb(${base.join(',')})`,
        });
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.src = src;
  });
}
