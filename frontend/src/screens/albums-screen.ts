import { bindable, customElement } from '@aurelia/runtime-html';
import { LlTopNav } from '../components/ll-top-nav.js';
import { LlRule } from '../components/ll-rule.js';
import type { Album } from '../models/types.js';

const template = /* html */ `
<div class="albums-screen">
  <ll-top-nav accent="var(--forest)" active-tab="albums" on-navigate.bind="onNavigate"></ll-top-nav>

  <main class="albums-screen__main">
    <div class="au">
      <p class="screen-eyebrow">Field Journal · \${albums.length} Albums</p>
      <h1 class="screen-heading">Your Archive</h1>
    </div>

    <ll-rule style="margin: 28px 0 40px;"></ll-rule>

    <div class="albums-grid">
      <div
        class="album-card au\${$index < 3 ? $index + 2 : 5}"
        repeat.for="album of albums"
        click.trigger="handleOpenAlbum(album)"
      >
        <!-- Stacked photo cards -->
        <div class="album-card__stack">
          <!-- Back card 1 (second photo) -->
          <div class="album-card__photo album-card__photo--back1" if.bind="album.photos.length > 1">
            <img class="album-card__thumb album-card__thumb--dim" src.bind="album.photos[1].thumb" alt="" />
          </div>
          <!-- Back card 2 (third photo) -->
          <div class="album-card__photo album-card__photo--back2" if.bind="album.photos.length > 2">
            <img class="album-card__thumb album-card__thumb--dim" src.bind="album.photos[2].thumb" alt="" />
          </div>
          <!-- Top card (cover) -->
          <div class="album-card__photo album-card__photo--top">
            <img class="album-card__thumb" src.bind="album.coverImg" alt.bind="album.title" />
            <div class="album-card__count-badge">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <rect x="1" y="3" width="8" height="6" stroke="currentColor" stroke-width="1"/>
                <rect x="3" y="1" width="8" height="6" stroke="currentColor" stroke-width="1" opacity="0.6"/>
              </svg>
              \${album.photos.length}
            </div>
          </div>
        </div>

        <!-- Meta -->
        <div>
          <h2 class="album-card__title">\${album.title}</h2>
          <div class="album-card__meta">
            <span class="album-card__date">\${album.date}</span>
            <span class="album-card__dot"></span>
            <span class="album-card__count-text">
              \${album.photos.length} \${album.photos.length === 1 ? 'photograph' : 'photographs'}
            </span>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>
`;

@customElement({ name: 'albums-screen', template, dependencies: [LlTopNav, LlRule] })
export class AlbumsScreen {
  @bindable() albums: Album[] = [];
  @bindable() onNavigate?: (tab: string) => void;
  @bindable() onOpenAlbum?: (album: Album) => void;

  handleOpenAlbum(album: Album): void {
    this.onOpenAlbum?.(album);
  }
}
