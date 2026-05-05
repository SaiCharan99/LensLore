export interface Photo {
  id: string;
  img: string;
  thumb: string;
  date: string;
  note: string;
  palette: {
    bg: string;
    accent: string;
    mid: string;
  };
  narrative: string | null;
}

export interface Album {
  id: string;
  title: string;
  date: string;
  coverImg: string;
  photos: Photo[];
}

export interface StoryPalette {
  bg: string;
  fg: string;
  accent: string;
  muted: string;
}

export type LayoutStyle =
  | 'centered-stacked'
  | 'asymmetric-left'
  | 'asymmetric-right'
  | 'vertical-rule'
  | 'minimal-corner'
  | 'frame-bordered';

export type MotifKind =
  | 'horizon-rule'
  | 'ornamental-flourish'
  | 'rain-streaks'
  | 'small-crest'
  | 'thin-lines'
  | 'tide-line'
  | 'storm-line';

export type HeadingFont = 'Playfair Display' | 'EB Garamond';

export interface DesignSpec {
  palette: StoryPalette;
  layout: LayoutStyle;
  headingFont: HeadingFont;
  motif: MotifKind;
  title: string;
  caption: string;
  mood: string;
}

export interface SubmitData {
  imageUrl: string | null;
  note: string;
}

export type AppScreen = 'upload' | 'albums' | 'album-detail' | 'story';

export interface ImageColors {
  top: string;
  mid: string;
  bot: string;
  topSoft: string;
  botSoft: string;
  base: string;
}
