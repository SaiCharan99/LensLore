import {
  HEADING_FONT_VALUES,
  LAYOUT_VALUES,
  MOTIF_VALUES,
} from '../shared/types.js';

export function buildPrompt(userNote: string, mood?: string): string {
  const moodHint = mood
    ? `\n\nMood hint from the photographer: "${mood}". Use this as inspiration but choose your own precise word for the final \`mood\` field.`
    : '';

  return `You are an editorial designer for a nature memoir web app. Given a photographer's note and photo, design a personalised page.

Photographer's note: "${userNote}"${moodHint}

Design principles:
- The design should feel like it was MADE for THIS specific moment — wildly different from any other page.
- Choose colors that emerge from the photo's mood and the note's emotional tone, not from a fixed palette.
- The title should evoke the moment in 3-6 words, drawn from the photographer's words rather than imposed.
- The caption should be the photographer's note, only lightly edited for grammar and flow. Preserve their voice. Do NOT rewrite or extend.

Field constraints:
- palette.bg: deep, atmospheric hex color (typically dark, derived from the mood)
- palette.fg: warm cream/parchment text colour, high contrast on bg
- palette.accent: single saturated accent — picked from the photo's mood
- palette.muted: low-contrast color for borders/decoration (rgba or hex)
- layout: one of ${LAYOUT_VALUES.map((v) => `"${v}"`).join(' | ')}
- headingFont: one of ${HEADING_FONT_VALUES.map((v) => `"${v}"`).join(' | ')}
- motif: one of ${MOTIF_VALUES.map((v) => `"${v}"`).join(' | ')}
- mood: one or two evocative words (e.g. "liminal", "amber-stillness", "mineral")`;
}

/**
 * JSON Schema for the DesignSpec response. The API constrains Claude to emit
 * a JSON object matching this shape — no markdown fences, no extra commentary.
 */
export const DESIGN_SPEC_SCHEMA = {
  type: 'object',
  properties: {
    palette: {
      type: 'object',
      properties: {
        bg: { type: 'string', description: 'Hex color for background' },
        fg: { type: 'string', description: 'Hex color for foreground text' },
        accent: { type: 'string', description: 'Hex color for accent' },
        muted: {
          type: 'string',
          description: 'Low-contrast color (hex or rgba)',
        },
      },
      required: ['bg', 'fg', 'accent', 'muted'],
      additionalProperties: false,
    },
    layout: { type: 'string', enum: LAYOUT_VALUES },
    headingFont: { type: 'string', enum: HEADING_FONT_VALUES },
    motif: { type: 'string', enum: MOTIF_VALUES },
    title: { type: 'string', description: '3-6 word evocative title' },
    caption: {
      type: 'string',
      description: "The photographer's note, lightly edited",
    },
    mood: { type: 'string', description: 'One or two evocative words' },
  },
  required: [
    'palette',
    'layout',
    'headingFont',
    'motif',
    'title',
    'caption',
    'mood',
  ],
  additionalProperties: false,
} as const;
