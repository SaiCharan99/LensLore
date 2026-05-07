import type { Handler } from 'aws-lambda';
import type Anthropic from '@anthropic-ai/sdk';

import { anthropic, MODEL } from '../shared/client.js';
import type { GoDeepInput, GoDeepOutput, PhotoContext } from './types.js';

const MAX_HISTORY_TURNS = 40;

/**
 * Continue a literary conversation about a specific photo.
 * The Symfony API maintains the durable history; this Lambda is stateless.
 */
export const handler: Handler<GoDeepInput, GoDeepOutput> = async (event) => {
  validateInput(event);

  const messages = buildMessages(event);

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: buildSystemPrompt(event.photoContext),
    messages,
  });

  const reply = extractText(response.content);
  return { reply };
};

function validateInput(event: GoDeepInput): void {
  if (!event.photoId || typeof event.photoId !== 'string') {
    throw new Error('photoId is required and must be a string.');
  }
  if (!event.newMessage || typeof event.newMessage !== 'string') {
    throw new Error('newMessage is required and must be a string.');
  }
  if (!Array.isArray(event.conversationHistory)) {
    throw new Error('conversationHistory must be an array.');
  }
}

function buildSystemPrompt(ctx: PhotoContext | undefined): string {
  const base =
    'You are a literary companion for a nature memoir app. The user has shared a photograph and a personal note about a moment they witnessed. Your role is to help them go deeper into that moment — recalling sensory detail, surfacing emotional texture, drawing connections to memory or place. Respond in 2-4 sentences. Match the contemplative, considered tone of the original note. Do not add unsolicited advice or explanations of your reasoning.';

  if (!ctx) return base;

  const parts: string[] = [base, '\nContext for this photo:'];
  if (ctx.title) parts.push(`- Title: ${ctx.title}`);
  if (ctx.note) parts.push(`- Photographer's note: ${ctx.note}`);
  if (ctx.caption && ctx.caption !== ctx.note)
    parts.push(`- Caption: ${ctx.caption}`);
  if (ctx.mood) parts.push(`- Mood: ${ctx.mood}`);
  return parts.join('\n');
}

function buildMessages(event: GoDeepInput): Anthropic.MessageParam[] {
  // Truncate history if it grows long — Sonnet 4.6's context window is huge,
  // but each call costs tokens, and old turns drift in relevance.
  const recent = event.conversationHistory.slice(-MAX_HISTORY_TURNS);

  const history: Anthropic.MessageParam[] = recent.map((turn) => ({
    role: turn.role,
    content: turn.content,
  }));

  // Append the new user message — the API expects messages to alternate
  // and end on a user turn.
  history.push({ role: 'user', content: event.newMessage });

  return history;
}

function extractText(content: Array<{ type: string; text?: string }>): string {
  const text = content
    .filter(
      (b): b is { type: 'text'; text: string } =>
        b.type === 'text' && typeof b.text === 'string',
    )
    .map((b) => b.text)
    .join('\n')
    .trim();
  if (!text) {
    throw new Error('Claude returned no text content.');
  }
  return text;
}
