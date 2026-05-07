import type { Handler } from 'aws-lambda';

import { anthropic, MODEL } from '../shared/client.js';
import type { DesignSpec } from '../shared/types.js';
import { buildPrompt, DESIGN_SPEC_SCHEMA } from './prompt.js';
import type {
  StoryGeneratorInput,
  StoryGeneratorOutput,
} from './types.js';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB decoded

/**
 * AWS Lambda handler.
 * Invoked synchronously by the Symfony backend (RequestResponse).
 *
 * Throwing inside the handler returns a Lambda error; the SDK puts the message
 * under `errorMessage` in the response payload, which Symfony's LambdaService
 * detects and surfaces as a 502.
 */
export const handler: Handler<StoryGeneratorInput, StoryGeneratorOutput> =
  async (event) => {
    validateInput(event);

    const prompt = buildPrompt(event.userNote, event.mood);
    const mediaType = detectMediaType(event.imageBase64);

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      output_config: {
        format: {
          type: 'json_schema',
          schema: DESIGN_SPEC_SCHEMA,
        },
      },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: event.imageBase64,
              },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    });

    return parseDesignSpec(response.content);
  };

function validateInput(event: StoryGeneratorInput): void {
  if (!event.imageBase64 || typeof event.imageBase64 !== 'string') {
    throw new Error('imageBase64 is required and must be a string.');
  }
  if (!event.userNote || typeof event.userNote !== 'string') {
    throw new Error('userNote is required and must be a string.');
  }
  // Base64 decoded size ≈ string length × 3/4. Reject early to save tokens.
  const approxBytes = Math.floor((event.imageBase64.length * 3) / 4);
  if (approxBytes > MAX_IMAGE_BYTES) {
    throw new Error(
      `Image too large: ${approxBytes} bytes (max ${MAX_IMAGE_BYTES}).`,
    );
  }
}

/**
 * Detect image MIME type from the first few base64 bytes.
 * Falls back to image/jpeg — Claude accepts mismatched media_type for these formats.
 */
function detectMediaType(
  base64: string,
): 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif' {
  // PNG starts with iVBORw, JPEG with /9j/, WEBP with UklGR, GIF with R0lGOD
  if (base64.startsWith('iVBORw')) return 'image/png';
  if (base64.startsWith('UklGR')) return 'image/webp';
  if (base64.startsWith('R0lGOD')) return 'image/gif';
  return 'image/jpeg';
}

function parseDesignSpec(
  content: Array<{ type: string; text?: string }>,
): DesignSpec {
  const textBlock = content.find(
    (b): b is { type: 'text'; text: string } =>
      b.type === 'text' && typeof b.text === 'string',
  );
  if (!textBlock) {
    throw new Error('Claude returned no text content.');
  }

  const parsed: unknown = JSON.parse(textBlock.text);
  if (!isDesignSpec(parsed)) {
    throw new Error(
      `Claude returned a payload that does not match DesignSpec: ${textBlock.text.slice(0, 200)}`,
    );
  }
  return parsed;
}

function isDesignSpec(value: unknown): value is DesignSpec {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  if (typeof v['title'] !== 'string') return false;
  if (typeof v['caption'] !== 'string') return false;
  if (typeof v['mood'] !== 'string') return false;
  if (typeof v['layout'] !== 'string') return false;
  if (typeof v['headingFont'] !== 'string') return false;
  if (typeof v['motif'] !== 'string') return false;
  const palette = v['palette'];
  if (typeof palette !== 'object' || palette === null) return false;
  const p = palette as Record<string, unknown>;
  return (
    typeof p['bg'] === 'string' &&
    typeof p['fg'] === 'string' &&
    typeof p['accent'] === 'string' &&
    typeof p['muted'] === 'string'
  );
}
