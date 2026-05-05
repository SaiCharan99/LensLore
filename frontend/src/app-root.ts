import { customElement } from '@aurelia/runtime-html';
import { UploadScreen } from './screens/upload-screen.js';
import { AlbumsScreen } from './screens/albums-screen.js';
import { AlbumDetailScreen } from './screens/album-detail-screen.js';
import { CinematicStoryPage } from './screens/cinematic-story-page.js';
import { SEED_ALBUMS } from './services/demo-data.js';
import type { Album, Photo, AppScreen, SubmitData } from './models/types.js';

const template = /* html */ `
<div>
  <!-- Journal / Upload -->
  <upload-screen
    if.bind="screen === 'upload'"
    on-submit.bind="handleSubmit"
    on-navigate.bind="navigate"
  ></upload-screen>

  <!-- Cinematic story (new entry) -->
  <cinematic-story-page
    if.bind="screen === 'story' && storyPhoto !== null"
    photo.bind="storyPhoto"
    on-close.bind="goBack"
  ></cinematic-story-page>

  <!-- Albums grid -->
  <albums-screen
    if.bind="screen === 'albums'"
    albums.bind="albums"
    on-navigate.bind="navigate"
    on-open-album.bind="openAlbum"
  ></albums-screen>

  <!-- Album detail -->
  <album-detail-screen
    if.bind="screen === 'album-detail' && activeAlbum !== null"
    album.bind="activeAlbum"
    on-navigate.bind="navigate"
    on-back.bind="backToAlbums"
    on-open-photo.bind="openPhoto"
  ></album-detail-screen>

  <!-- Photo cinematic story (from album) -->
  <cinematic-story-page
    if.bind="screen === 'photo-story' && storyPhoto !== null"
    photo.bind="storyPhoto"
    preset-idx.bind="storyPresetIdx"
    on-close.bind="backFromPhoto"
  ></cinematic-story-page>
</div>
`;

// Ephemeral photo object for new entries submitted from the journal
function makeEphemeralPhoto(data: SubmitData): Photo {
  return {
    id: `new-${Date.now()}`,
    img: data.imageUrl ?? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80',
    thumb: data.imageUrl ?? 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70',
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    note: data.note,
    palette: { bg: '#1a1f2e', accent: '#7a9fc4', mid: '#3a4f6e' },
    narrative: null,
  };
}

@customElement({
  name: 'app-root',
  template,
  dependencies: [UploadScreen, AlbumsScreen, AlbumDetailScreen, CinematicStoryPage],
})
export class AppRoot {
  screen: AppScreen | 'photo-story' = 'upload';
  albums: Album[] = SEED_ALBUMS;
  activeAlbum: Album | null = null;
  storyPhoto: Photo | null = null;
  storyPresetIdx = 0;

  navigate = (tab: string): void => {
    if (tab === 'upload' || tab === 'journal') {
      this.screen = 'upload';
    } else if (tab === 'albums') {
      this.screen = 'albums';
    }
  };

  handleSubmit = (data: SubmitData): void => {
    this.storyPhoto = makeEphemeralPhoto(data);
    this.screen = 'story';
    window.scrollTo(0, 0);
  };

  openAlbum = (album: Album): void => {
    this.activeAlbum = album;
    this.screen = 'album-detail';
  };

  backToAlbums = (): void => {
    this.activeAlbum = null;
    this.screen = 'albums';
  };

  openPhoto = (photo: Photo, presetIdx: number): void => {
    this.storyPhoto = photo;
    this.storyPresetIdx = presetIdx;
    this.screen = 'photo-story';
  };

  goBack = (): void => {
    this.screen = 'upload';
    this.storyPhoto = null;
  };

  backFromPhoto = (): void => {
    this.screen = 'album-detail';
    this.storyPhoto = null;
  };
}
