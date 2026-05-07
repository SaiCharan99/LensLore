/**
 * Mirror of the frontend `DesignSpec` interface and the Symfony
 * `App\DTO\StorySpecResponse`. Field-for-field compatible across all three.
 */
export interface DesignSpec {
  palette: {
    bg: string;
    fg: string;
    accent: string;
    muted: string;
  };
  layout:
    | 'centered-stacked'
    | 'asymmetric-left'
    | 'asymmetric-right'
    | 'vertical-rule'
    | 'minimal-corner'
    | 'frame-bordered';
  headingFont: 'Playfair Display' | 'EB Garamond';
  motif:
    | 'horizon-rule'
    | 'ornamental-flourish'
    | 'rain-streaks'
    | 'small-crest'
    | 'thin-lines'
    | 'tide-line'
    | 'storm-line';
  title: string;
  caption: string;
  mood: string;
}

export const LAYOUT_VALUES: DesignSpec['layout'][] = [
  'centered-stacked',
  'asymmetric-left',
  'asymmetric-right',
  'vertical-rule',
  'minimal-corner',
  'frame-bordered',
];

export const HEADING_FONT_VALUES: DesignSpec['headingFont'][] = [
  'Playfair Display',
  'EB Garamond',
];

export const MOTIF_VALUES: DesignSpec['motif'][] = [
  'horizon-rule',
  'ornamental-flourish',
  'rain-streaks',
  'small-crest',
  'thin-lines',
  'tide-line',
  'storm-line',
];
