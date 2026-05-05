import { bindable, customElement } from '@aurelia/runtime-html';
import { LlTopNav } from '../components/ll-top-nav.js';
import { LlRule } from '../components/ll-rule.js';
import type { Album, Photo } from '../models/types.js';

const template = /* html */ `
<div class="album-detail">
  <ll-top-nav accent="var(--forest)" active-tab="albums" on-navigate.bind="onNavigate"></ll-top-nav>

  <main class="album-detail__main">
    <!-- Breadcrumb -->
    <button class="breadcrumb-btn au" click.trigger="handleBack()">
      ← Albums
    </button>

    <!-- Header -->
    <div class="au2" style="margin-bottom: 8px;">
      <p class="album-detail__eyebrow">
        \${album.date} · \${album.photos.length} photographs
      </p>
      <h1 class="album-detail__heading">\${album.title}</h1>
    </div>

    <ll-rule style="margin: 28px 0 36px;"></ll-rule>

    <!-- Photo grid -->
    <div class="photo-grid">
      <div
        class="photo-tile au\${$index < 3 ? $index + 2 : 5}"
        repeat.for="photo of album.photos"
        click.trigger="handleOpenPhoto(photo, $index)"
      >
        <img class="photo-tile__img" src.bind="photo.thumb" alt="" />

        <!-- Hover overlay with note preview -->
        <div class="photo-tile__overlay">
          <p class="photo-tile__note">\${photo.note}</p>
        </div>

        <!-- Date badge -->
        <div class="photo-tile__date-badge">\${photo.date}</div>
      </div>
    </div>
  </main>
</div>
`;

@customElement({ name: 'album-detail-screen', template, dependencies: [LlTopNav, LlRule] })
export class AlbumDetailScreen {
  @bindable() album!: Album;
  @bindable() onNavigate?: (tab: string) => void;
  @bindable() onBack?: () => void;
  @bindable() onOpenPhoto?: (photo: Photo, presetIdx: number) => void;

  handleBack(): void {
    this.onBack?.();
  }

  handleOpenPhoto(photo: Photo, idx: number): void {
    this.onOpenPhoto?.(photo, idx);
  }
}
