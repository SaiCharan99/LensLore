import type { DesignSpec } from '../shared/types.js';

export interface StoryGeneratorInput {
  imageBase64: string;
  userNote: string;
  mood?: string;
}

export type StoryGeneratorOutput = DesignSpec;

export interface StoryGeneratorError {
  errorMessage: string;
}
