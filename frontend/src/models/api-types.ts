/**
 * Wire-format types as returned by the Symfony backend.
 *
 * Kept separate from `models/types.ts` (the in-app domain types) so we can:
 * - Track backend contract drift in one place
 * - Validate response shapes once, then work with strict frontend types
 */

import type { DesignSpec } from './types.js';

export interface ApiAlbum {
  id: number;
  title: string;
  date: string;
  coverImg: string | null;
  photoCount: number;
}

export interface ApiMessage {
  id: number | null;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ApiPhoto {
  id: number;
  albumId: number;
  img: string;
  thumb: string;
  note: string;
  date: string;
  storySpec: DesignSpec | null;
  messages: ApiMessage[];
}

export interface ApiCreateAlbumBody {
  title: string;
}

export interface ApiCreatePhotoBody {
  imageBase64: string;
  note: string;
  mood: string;
  albumId: number;
}

export interface ApiSendMessageBody {
  content: string;
}

export interface ApiAddMessageResponse {
  user: ApiMessage;
  assistant: ApiMessage;
}

export interface ApiValidationError {
  errors: Record<string, string>;
}

export interface ApiGenericError {
  error: string;
}
