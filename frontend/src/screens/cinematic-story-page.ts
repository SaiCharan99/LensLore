import { bindable, customElement, ICustomElementViewModel } from '@aurelia/runtime-html';
import { LlMotif } from '../components/ll-motif.js';
import { LlComposingLoader } from '../components/ll-composing-loader.js';
import { LlFullscreenPhoto } from '../components/ll-fullscreen-photo.js';
import { sampleImageColors } from '../services/image-colors.js';
import { pickPreset } from '../services/demo-data.js';
import type { Photo, DesignSpec, ImageColors } from '../models/types.js';

const template = /* html */ `
<div>
  <!-- Composing loader -->
  <ll-composing-loader
    if.bind="loading"
    accent.bind="fallbackAccent"
  ></ll-composing-loader>

  <!-- The composed page -->
  <div
    class="cinematic-page ai"
    if.bind="!loading"
    css="background: \${bgColor}; color: \${fgColor};"
  >
    <!-- Subtle atmosphere gradient -->
    <div
      class="cinematic-page__atmosphere"
      css="background: radial-gradient(ellipse at center top, \${spec.palette.accent}15 0%, transparent 60%);"
    ></div>

    <!-- Close button -->
    <button
      class="cinematic-page__close"
      css="background: \${bgColor}cc; border-color: \${fgColor}20;"
      click.trigger="handleClose()"
    >×</button>

    <!-- Content -->
    <div class="cinematic-page__content">

      <!-- ── LAYOUT: centered-stacked ── -->
      <template if.bind="spec.layout === 'centered-stacked'">
        <!-- Photo bleed block -->
        <div class="photo-bleed" style="padding-top: 80px; padding-bottom: 40px;">
          <img class="photo-bleed__bg" src.bind="photo.img" alt="" aria-hidden="true" />
          <div
            class="photo-bleed__vignette"
            css="background: radial-gradient(ellipse 80% 90% at 50% 50%, transparent 30%, \${bgColor}cc 90%);"
          ></div>
          <div class="photo-bleed__frame" click.trigger="showFullscreen = true">
            <img class="photo-bleed__img" src.bind="photo.img" alt="" />
            <div class="photo-bleed__tap-hint" css="color: \${fgColor}; opacity: 0.7;">↗ &nbsp; tap to view fullscreen</div>
          </div>
        </div>

        <div class="layout-content layout-content--centered" style="padding-top: 56px; padding-bottom: 80px;">
          <p class="layout-eyebrow" css="color: \${spec.palette.accent};">\${photo.date} · \${spec.mood}</p>
          <h1 class="layout-title" css="font-family: '\${spec.headingFont}', Georgia, serif; font-size: 46px; color: \${fgColor}; margin-bottom: 28px;">\${spec.title}</h1>
          <ll-motif kind.bind="spec.motif" color.bind="spec.palette.accent"></ll-motif>
          <p class="layout-caption" css="font-family: var(--font-body); font-size: 18px; color: \${mutedColor}; max-width: 500px; margin-top: 36px;">\${spec.caption}</p>
        </div>
      </template>

      <!-- ── LAYOUT: asymmetric-left ── -->
      <template if.bind="spec.layout === 'asymmetric-left'">
        <div class="photo-bleed">
          <img class="photo-bleed__bg" src.bind="photo.img" alt="" aria-hidden="true" />
          <div class="photo-bleed__vignette" css="background: radial-gradient(ellipse 80% 90% at 50% 50%, transparent 30%, \${bgColor}cc 90%);"></div>
          <div class="photo-bleed__frame" click.trigger="showFullscreen = true">
            <img class="photo-bleed__img" src.bind="photo.img" alt="" />
            <div class="photo-bleed__tap-hint" css="color: \${fgColor}; opacity: 0.7;">↗ &nbsp; tap to view fullscreen</div>
          </div>
        </div>
        <div class="layout-content" style="display: grid; grid-template-columns: 1fr 1.4fr; gap: 56px; align-items: start;">
          <div>
            <p class="layout-eyebrow" css="color: \${spec.palette.accent};">\${photo.date} · \${spec.mood}</p>
            <ll-motif kind.bind="spec.motif" color.bind="spec.palette.accent"></ll-motif>
          </div>
          <div>
            <h1 class="layout-title" css="font-family: '\${spec.headingFont}', Georgia, serif; font-size: 44px; color: \${fgColor};">\${spec.title}</h1>
            <p class="layout-caption layout-caption--bordered" css="font-family: var(--font-body); font-size: 17px; color: \${mutedColor}; border-left-color: \${spec.palette.accent}; max-width: 480px;">\${spec.caption}</p>
          </div>
        </div>
      </template>

      <!-- ── LAYOUT: asymmetric-right ── -->
      <template if.bind="spec.layout === 'asymmetric-right'">
        <div class="photo-bleed">
          <img class="photo-bleed__bg" src.bind="photo.img" alt="" aria-hidden="true" />
          <div class="photo-bleed__vignette" css="background: radial-gradient(ellipse 80% 90% at 50% 50%, transparent 30%, \${bgColor}cc 90%);"></div>
          <div class="photo-bleed__frame" click.trigger="showFullscreen = true">
            <img class="photo-bleed__img" src.bind="photo.img" alt="" />
            <div class="photo-bleed__tap-hint" css="color: \${fgColor}; opacity: 0.7;">↗ &nbsp; tap to view fullscreen</div>
          </div>
        </div>
        <div class="layout-content" style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 56px; align-items: start;">
          <div>
            <h1 class="layout-title" css="font-family: '\${spec.headingFont}', Georgia, serif; font-size: 42px; color: \${fgColor};">\${spec.title}</h1>
            <p class="layout-caption" css="font-family: var(--font-body); font-size: 17px; color: \${mutedColor}; max-width: 480px;">\${spec.caption}</p>
          </div>
          <div style="text-align: right;">
            <p class="layout-eyebrow" css="color: \${spec.palette.accent};">\${photo.date} · \${spec.mood}</p>
            <ll-motif kind.bind="spec.motif" color.bind="spec.palette.accent"></ll-motif>
          </div>
        </div>
      </template>

      <!-- ── LAYOUT: vertical-rule ── -->
      <template if.bind="spec.layout === 'vertical-rule'">
        <div class="photo-bleed">
          <img class="photo-bleed__bg" src.bind="photo.img" alt="" aria-hidden="true" />
          <div class="photo-bleed__vignette" css="background: radial-gradient(ellipse 80% 90% at 50% 50%, transparent 30%, \${bgColor}cc 90%);"></div>
          <div class="photo-bleed__frame" click.trigger="showFullscreen = true">
            <img class="photo-bleed__img" src.bind="photo.img" alt="" />
            <div class="photo-bleed__tap-hint" css="color: \${fgColor}; opacity: 0.7;">↗ &nbsp; tap to view fullscreen</div>
          </div>
        </div>
        <div class="layout-content" style="max-width: 860px; display: grid; grid-template-columns: auto 1px 1fr; gap: 40px; align-items: stretch;">
          <div style="writing-mode: vertical-rl; transform: rotate(180deg); font-family: var(--font-ui); font-size: 10px; letter-spacing: 0.3em; text-transform: uppercase; align-self: center;" css="color: \${spec.palette.accent};">\${photo.date} · LensLore</div>
          <div css="background: \${spec.palette.accent}66; width: 1px;"></div>
          <div>
            <h1 class="layout-title" css="font-family: '\${spec.headingFont}', Georgia, serif; font-size: 42px; color: \${fgColor};">\${spec.title}</h1>
            <ll-motif kind.bind="spec.motif" color.bind="spec.palette.accent"></ll-motif>
            <p class="layout-caption" css="font-family: var(--font-body); font-size: 17px; color: \${mutedColor}; margin-top: 28px; max-width: 500px;">\${spec.caption}</p>
          </div>
        </div>
      </template>

      <!-- ── LAYOUT: minimal-corner ── -->
      <template if.bind="spec.layout === 'minimal-corner'">
        <div class="photo-bleed">
          <img class="photo-bleed__bg" src.bind="photo.img" alt="" aria-hidden="true" />
          <div class="photo-bleed__vignette" css="background: radial-gradient(ellipse 80% 90% at 50% 50%, transparent 30%, \${bgColor}cc 90%);"></div>
          <div class="photo-bleed__frame" click.trigger="showFullscreen = true">
            <img class="photo-bleed__img" src.bind="photo.img" alt="" />
            <div class="photo-bleed__tap-hint" css="color: \${fgColor}; opacity: 0.7;">↗ &nbsp; tap to view fullscreen</div>
          </div>
        </div>
        <div class="layout-content" style="max-width: 1100px; display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: start; padding: 56px 64px 80px;">
          <div>
            <p class="layout-eyebrow" css="color: \${spec.palette.accent};">\${photo.date}</p>
            <h1 class="layout-title" css="font-family: '\${spec.headingFont}', Georgia, serif; font-size: 40px; color: \${fgColor}; max-width: 440px;">\${spec.title}</h1>
            <div style="margin-top: 20px;"><ll-motif kind.bind="spec.motif" color.bind="spec.palette.accent"></ll-motif></div>
          </div>
          <div>
            <p class="layout-eyebrow" css="color: \${spec.palette.accent};">\${spec.mood}</p>
            <p class="layout-caption layout-caption--bordered" css="font-family: var(--font-body); font-size: 17px; color: \${mutedColor}; border-left-color: \${spec.palette.accent}; max-width: 420px;">\${spec.caption}</p>
          </div>
        </div>
      </template>

      <!-- ── LAYOUT: frame-bordered ── -->
      <template if.bind="spec.layout === 'frame-bordered'">
        <div class="photo-bleed">
          <img class="photo-bleed__bg" src.bind="photo.img" alt="" aria-hidden="true" />
          <div class="photo-bleed__vignette" css="background: radial-gradient(ellipse 80% 90% at 50% 50%, transparent 30%, \${bgColor}cc 90%);"></div>
          <div class="photo-bleed__frame" click.trigger="showFullscreen = true">
            <img class="photo-bleed__img" src.bind="photo.img" alt="" />
            <div class="photo-bleed__tap-hint" css="color: \${fgColor}; opacity: 0.7;">↗ &nbsp; tap to view fullscreen</div>
          </div>
        </div>
        <div style="width: 100%; padding: 56px 40px 80px; display: flex; justify-content: center;">
          <div class="layout-content--frame" css="border: 1px solid \${spec.palette.accent}66;">
            <!-- Corner dots -->
            <div css="position: absolute; top: -4px; left: -4px; width: 8px; height: 8px; background: \${spec.palette.accent};"></div>
            <div css="position: absolute; top: -4px; right: -4px; width: 8px; height: 8px; background: \${spec.palette.accent};"></div>
            <div css="position: absolute; bottom: -4px; left: -4px; width: 8px; height: 8px; background: \${spec.palette.accent};"></div>
            <div css="position: absolute; bottom: -4px; right: -4px; width: 8px; height: 8px; background: \${spec.palette.accent};"></div>
            <div style="text-align: center;">
              <p class="layout-eyebrow" css="color: \${spec.palette.accent};">\${photo.date} · \${spec.mood}</p>
              <h1 class="layout-title" css="font-family: '\${spec.headingFont}', Georgia, serif; font-size: 38px; color: \${fgColor}; margin-bottom: 18px;">\${spec.title}</h1>
              <div style="display: flex; justify-content: center; margin-bottom: 28px;">
                <ll-motif kind.bind="spec.motif" color.bind="spec.palette.accent"></ll-motif>
              </div>
              <p class="layout-caption" css="font-family: var(--font-body); font-size: 17px; color: \${mutedColor}; max-width: 480px; margin: 0 auto;">\${spec.caption}</p>
            </div>
          </div>
        </div>
      </template>

    </div>

    <!-- Footer signature -->
    <div class="cinematic-page__footer" css="color: \${spec.palette.accent}80;">
      LensLore Field Entry · designed for this moment
    </div>

    <!-- Fullscreen overlay -->
    <ll-fullscreen-photo
      if.bind="showFullscreen"
      src.bind="photo.img"
      bg.bind="bgColor"
      on-close.bind="closeFullscreen"
    ></ll-fullscreen-photo>
  </div>
</div>
`;

@customElement({
  name: 'cinematic-story-page',
  template,
  dependencies: [LlMotif, LlComposingLoader, LlFullscreenPhoto],
})
export class CinematicStoryPage implements ICustomElementViewModel {
  @bindable() photo!: Photo;
  @bindable() presetIdx?: number;
  @bindable() onClose?: () => void;

  loading = true;
  spec!: DesignSpec;
  showFullscreen = false;
  imageColors: ImageColors | null = null;

  get fallbackAccent(): string {
    return pickPreset(this.photo.id, this.presetIdx).palette.accent;
  }

  get bgColor(): string {
    return this.imageColors?.base ?? this.spec.palette.bg;
  }

  fgColor = '#F5EFE4';
  mutedColor = 'rgba(245, 239, 228, 0.78)';

  async attaching(): Promise<void> {
    const fallback = pickPreset(this.photo.id, this.presetIdx);
    const minWait = new Promise<void>((res) => setTimeout(res, 1800));

    this.imageColors = await sampleImageColors(this.photo.img).catch(() => null);

    await minWait;
    this.spec = { ...fallback, caption: this.photo.note };
    this.loading = false;
  }

  handleClose(): void {
    this.onClose?.();
  }

  closeFullscreen = (): void => {
    this.showFullscreen = false;
  };
}
