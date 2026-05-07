import { afterEach, describe, expect, it, vi } from 'vitest';

import type { DesignSpec } from '../src/shared/types.js';

const createMock = vi.fn();

// Mock @anthropic-ai/sdk before the handler imports it.
vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { create: createMock };
  },
}));

// Dynamic import — must be after vi.mock so the handler picks up the mock.
const { handler } = await import('../src/story-generator/handler.js');

const VALID_SPEC: DesignSpec = {
  palette: {
    bg: '#1a1f2e',
    fg: '#F5EFE4',
    accent: '#7a9fc4',
    muted: 'rgba(245,239,228,0.78)',
  },
  layout: 'centered-stacked',
  headingFont: 'Playfair Display',
  motif: 'horizon-rule',
  title: 'The Ridge at Dawn',
  caption: 'Cloud inversion below, silence above.',
  mood: 'contemplative',
};

function mockClaudeResponse(spec: DesignSpec | string): void {
  createMock.mockResolvedValue({
    content: [
      {
        type: 'text',
        text: typeof spec === 'string' ? spec : JSON.stringify(spec),
      },
    ],
  });
}

afterEach(() => {
  createMock.mockReset();
});

describe('story-generator', () => {
  it('returns a parsed DesignSpec when Claude responds with valid JSON', async () => {
    mockClaudeResponse(VALID_SPEC);

    const result = await handler(
      {
        imageBase64: 'fake-image-bytes',
        userNote: 'Standing on the ridge above Torridon at dawn.',
        mood: 'contemplative',
      },
      {} as never,
      () => undefined,
    );

    expect(result).toEqual(VALID_SPEC);
    expect(createMock).toHaveBeenCalledOnce();
  });

  it('passes the image as a base64 source with detected media type (PNG)', async () => {
    mockClaudeResponse(VALID_SPEC);

    await handler(
      {
        imageBase64: 'iVBORw0KGgoFAKE',
        userNote: 'A morning frame.',
      },
      {} as never,
      () => undefined,
    );

    const call = createMock.mock.calls[0]?.[0];
    expect(call).toBeDefined();
    expect(call.messages[0].content[0]).toMatchObject({
      type: 'image',
      source: {
        type: 'base64',
        media_type: 'image/png',
        data: 'iVBORw0KGgoFAKE',
      },
    });
  });

  it('uses output_config to constrain Claude to JSON schema', async () => {
    mockClaudeResponse(VALID_SPEC);

    await handler(
      { imageBase64: 'fake', userNote: 'A note long enough.' },
      {} as never,
      () => undefined,
    );

    const call = createMock.mock.calls[0]?.[0];
    expect(call.output_config?.format?.type).toBe('json_schema');
    expect(call.output_config?.format?.schema?.required).toContain('palette');
  });

  it('rejects missing imageBase64', async () => {
    await expect(
      handler(
        { imageBase64: '', userNote: 'note' } as never,
        {} as never,
        () => undefined,
      ),
    ).rejects.toThrow(/imageBase64/);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('rejects missing userNote', async () => {
    await expect(
      handler(
        { imageBase64: 'fake', userNote: '' } as never,
        {} as never,
        () => undefined,
      ),
    ).rejects.toThrow(/userNote/);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('rejects oversized images', async () => {
    // 6MB worth of base64 → ~8MB string
    const huge = 'A'.repeat(8 * 1024 * 1024);
    await expect(
      handler(
        { imageBase64: huge, userNote: 'note' },
        {} as never,
        () => undefined,
      ),
    ).rejects.toThrow(/Image too large/);
    expect(createMock).not.toHaveBeenCalled();
  });

  it('throws when Claude returns malformed JSON', async () => {
    mockClaudeResponse('this is not JSON at all');

    await expect(
      handler(
        { imageBase64: 'fake', userNote: 'note' },
        {} as never,
        () => undefined,
      ),
    ).rejects.toThrow();
  });

  it('throws when Claude returns JSON missing required fields', async () => {
    mockClaudeResponse(JSON.stringify({ title: 'partial' }));

    await expect(
      handler(
        { imageBase64: 'fake', userNote: 'note' },
        {} as never,
        () => undefined,
      ),
    ).rejects.toThrow(/does not match DesignSpec/);
  });

  it('throws when Claude returns no text block', async () => {
    createMock.mockResolvedValue({ content: [] });

    await expect(
      handler(
        { imageBase64: 'fake', userNote: 'note' },
        {} as never,
        () => undefined,
      ),
    ).rejects.toThrow(/no text content/);
  });
});
