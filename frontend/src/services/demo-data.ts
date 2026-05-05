import type { Album } from '../models/types.js';

export const SEED_ALBUMS: Album[] = [
  {
    id: 'a1',
    title: 'Highland Edges',
    date: 'March – April 2026',
    coverImg: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    photos: [
      {
        id: 'p1',
        img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=70',
        date: '14 March 2026',
        note: 'Standing on the ridge above Torridon just before sunrise. The cloud inversion below me made it feel like the earth had dissolved. I was absolutely alone and it felt like a privilege, not a loneliness.',
        palette: { bg: '#1a1f2e', accent: '#7a9fc4', mid: '#3a4f6e' },
        narrative: 'The world below had gone quiet in the way that only altitude allows — the ordinary dissolved into vapour, each ridge emerging like a sentence half-remembered.',
      },
      {
        id: 'p2',
        img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=70',
        date: '22 March 2026',
        note: 'The deer appeared at the tree line just as the light went amber. She looked at me for a long time before deciding I was harmless. I didn\'t breathe.',
        palette: { bg: '#1e1a14', accent: '#c4956a', mid: '#5c3f28' },
        narrative: 'There is a grammar to how wild things look at you — measuring, unhurried, always with the option of disappearing still in their possession.',
      },
      {
        id: 'p3',
        img: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=70',
        date: '3 April 2026',
        note: 'Rain coming in off the loch. Everything smelled of peat and wet stone. I felt more awake than I had in months.',
        palette: { bg: '#141c1a', accent: '#6ba897', mid: '#2a4a42' },
        narrative: 'Rain in wild places does not apologise. It arrives with the manner of something that has always belonged there.',
      },
    ],
  },
  {
    id: 'a2',
    title: 'Garden Watch',
    date: 'January – May 2026',
    coverImg: 'https://images.unsplash.com/photo-1444927714506-8492d94b4e3d?w=800&q=80',
    photos: [
      {
        id: 'p4',
        img: 'https://images.unsplash.com/photo-1444927714506-8492d94b4e3d?w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1444927714506-8492d94b4e3d?w=400&q=70',
        date: '7 January 2026',
        note: 'A robin came back to the same branch for the fifth morning in a row. I started leaving the tea to go cold so I wouldn\'t move and scare it.',
        palette: { bg: '#1c1612', accent: '#c4724a', mid: '#5c3220' },
        narrative: 'There are small loyalties in nature that ask nothing of you and give everything.',
      },
      {
        id: 'p5',
        img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400&q=70',
        date: '12 February 2026',
        note: 'First snowdrops in the corner bed. Tiny, inconceivably white. February outside but something already shifting underneath.',
        palette: { bg: '#16181e', accent: '#a0afc0', mid: '#3a4050' },
        narrative: 'Snowdrops do not announce themselves. They arrive in the syntax of the understated — small white sentences in the language of return.',
      },
    ],
  },
  {
    id: 'a3',
    title: 'Coastal Light',
    date: 'February 2026',
    coverImg: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=800&q=80',
    photos: [
      {
        id: 'p6',
        img: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=70',
        date: '2 February 2026',
        note: 'Low tide, mid-morning. The sand was so flat and still it looked like brushed metal. A single oystercatcher picking along the edge. I sat down on the wet sand and didn\'t care.',
        palette: { bg: '#14181e', accent: '#8fa8c0', mid: '#2c3c50' },
        narrative: 'The shore at low tide is an argument for simplicity. Everything extraneous has been drawn back, and what remains is the thing itself.',
      },
      {
        id: 'p7',
        img: 'https://images.unsplash.com/photo-1548777123-e216912df7d8?w=1200&q=80',
        thumb: 'https://images.unsplash.com/photo-1548777123-e216912df7d8?w=400&q=70',
        date: '2 February 2026',
        note: 'Same afternoon, the light changed completely in about fifteen minutes. Storm coming in from the west. I stayed longer than I should have.',
        palette: { bg: '#0e1218', accent: '#6b82a8', mid: '#1e2a3a' },
        narrative: 'There is a light that arrives before a storm that has no equivalent elsewhere — a greenish, held quality that makes every surface look as though it is lit from within.',
      },
    ],
  },
];

export const DESIGN_PRESETS = [
  {
    palette: { bg: '#0f1822', fg: '#e8d9b8', accent: '#c4956a', muted: '#5a6478' },
    layout: 'asymmetric-left' as const,
    headingFont: 'Playfair Display' as const,
    motif: 'horizon-rule' as const,
    mood: 'liminal',
    title: 'At the hinge of two weathers',
    caption: '',
  },
  {
    palette: { bg: '#1c1410', fg: '#f0d4a8', accent: '#d4a574', muted: '#6b4a32' },
    layout: 'centered-stacked' as const,
    headingFont: 'EB Garamond' as const,
    motif: 'ornamental-flourish' as const,
    mood: 'amber-stillness',
    title: 'A quiet, measured looking',
    caption: '',
  },
  {
    palette: { bg: '#0a1614', fg: '#cae0d4', accent: '#7ab098', muted: '#3a5a50' },
    layout: 'vertical-rule' as const,
    headingFont: 'Playfair Display' as const,
    motif: 'rain-streaks' as const,
    mood: 'mineral',
    title: 'Peat, bracken, ancient air',
    caption: '',
  },
  {
    palette: { bg: '#1a1208', fg: '#e8c89c', accent: '#d49648', muted: '#6b4a20' },
    layout: 'frame-bordered' as const,
    headingFont: 'EB Garamond' as const,
    motif: 'small-crest' as const,
    mood: 'small-loyalty',
    title: 'A returning, agreed upon',
    caption: '',
  },
  {
    palette: { bg: '#101218', fg: '#d4dce8', accent: '#9cb0c8', muted: '#3a4458' },
    layout: 'minimal-corner' as const,
    headingFont: 'Playfair Display' as const,
    motif: 'thin-lines' as const,
    mood: 'pencil-grey',
    title: 'Quiet syntax of return',
    caption: '',
  },
  {
    palette: { bg: '#0c1218', fg: '#cad6e4', accent: '#88a4c0', muted: '#2c3848' },
    layout: 'asymmetric-right' as const,
    headingFont: 'Playfair Display' as const,
    motif: 'tide-line' as const,
    mood: 'flat-light',
    title: 'The square metre in front of you',
    caption: '',
  },
  {
    palette: { bg: '#08101a', fg: '#aabacc', accent: '#5e7a9a', muted: '#1c2838' },
    layout: 'centered-stacked' as const,
    headingFont: 'EB Garamond' as const,
    motif: 'storm-line' as const,
    mood: 'iron-light',
    title: 'Patient long enough',
    caption: '',
  },
];

export function pickPreset(photoId: string, idx?: number): (typeof DESIGN_PRESETS)[number] {
  if (typeof idx === 'number') {
    return DESIGN_PRESETS[idx % DESIGN_PRESETS.length];
  }
  let h = 0;
  for (let i = 0; i < photoId.length; i++) {
    h = ((h * 31) + photoId.charCodeAt(i)) >>> 0;
  }
  return DESIGN_PRESETS[h % DESIGN_PRESETS.length];
}
