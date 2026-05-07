import Anthropic from '@anthropic-ai/sdk';

/**
 * Single shared Anthropic client. The SDK reads ANTHROPIC_API_KEY from env;
 * Terraform injects it from AWS Secrets Manager at deploy time.
 *
 * Module-level singleton — Lambda execution contexts reuse warm modules,
 * so this client persists across invocations within the same container.
 */
export const anthropic = new Anthropic();

/**
 * Sonnet 4.6: vision-capable, supports structured outputs (json_schema),
 * and is the cost/latency sweet spot for per-photo generation.
 */
export const MODEL = 'claude-sonnet-4-6';
