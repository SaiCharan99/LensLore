import { afterEach, describe, expect, it, vi } from 'vitest';

const createMock = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { create: createMock };
  },
}));

const { handler } = await import('../src/go-deeper/handler.js');

function mockReply(text: string): void {
  createMock.mockResolvedValue({
    content: [{ type: 'text', text }],
  });
}

afterEach(() => {
  createMock.mockReset();
});

describe('go-deeper', () => {
  it('returns Claude reply text', async () => {
    mockReply('The light at that hour does carry a particular weight.');

    const result = await handler(
      {
        photoId: 'photo-1',
        conversationHistory: [],
        newMessage: 'Tell me what you see in the silence.',
      },
      {} as never,
      () => undefined,
    );

    expect(result).toEqual({
      reply: 'The light at that hour does carry a particular weight.',
    });
  });

  it('appends the new message after history and ends on a user turn', async () => {
    mockReply('Mm.');

    await handler(
      {
        photoId: 'photo-1',
        conversationHistory: [
          { role: 'user', content: 'I noticed the cloud line was perfect.' },
          {
            role: 'assistant',
            content: 'Cloud inversions read like punctuation in the sky.',
          },
        ],
        newMessage: 'It felt like punctuation, yes.',
      },
      {} as never,
      () => undefined,
    );

    const call = createMock.mock.calls[0]?.[0];
    expect(call.messages).toHaveLength(3);
    expect(call.messages[2]).toEqual({
      role: 'user',
      content: 'It felt like punctuation, yes.',
    });
  });

  it('includes photo context in the system prompt when provided', async () => {
    mockReply('A response.');

    await handler(
      {
        photoId: 'photo-1',
        photoContext: {
          title: 'The Ridge at Dawn',
          caption: 'Cloud inversion below, silence above.',
          mood: 'contemplative',
          note: 'Standing on the ridge above Torridon at dawn.',
        },
        conversationHistory: [],
        newMessage: 'Go deeper.',
      },
      {} as never,
      () => undefined,
    );

    const call = createMock.mock.calls[0]?.[0];
    expect(call.system).toContain('The Ridge at Dawn');
    expect(call.system).toContain('Torridon');
    expect(call.system).toContain('contemplative');
  });

  it('truncates long conversation history to the last 40 turns', async () => {
    mockReply('Brief reply.');

    const longHistory = Array.from({ length: 60 }, (_, i) => ({
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `Turn ${i}`,
    }));

    await handler(
      {
        photoId: 'photo-1',
        conversationHistory: longHistory,
        newMessage: 'Latest.',
      },
      {} as never,
      () => undefined,
    );

    const call = createMock.mock.calls[0]?.[0];
    // 40 history turns + 1 new = 41 messages
    expect(call.messages).toHaveLength(41);
    expect(call.messages[0].content).toBe('Turn 20'); // first kept turn
  });

  it('rejects missing photoId', async () => {
    await expect(
      handler(
        {
          photoId: '',
          conversationHistory: [],
          newMessage: 'hello',
        } as never,
        {} as never,
        () => undefined,
      ),
    ).rejects.toThrow(/photoId/);
  });

  it('rejects missing newMessage', async () => {
    await expect(
      handler(
        {
          photoId: 'p1',
          conversationHistory: [],
          newMessage: '',
        } as never,
        {} as never,
        () => undefined,
      ),
    ).rejects.toThrow(/newMessage/);
  });

  it('throws when Claude returns no text', async () => {
    createMock.mockResolvedValue({ content: [] });

    await expect(
      handler(
        {
          photoId: 'p1',
          conversationHistory: [],
          newMessage: 'hi',
        },
        {} as never,
        () => undefined,
      ),
    ).rejects.toThrow(/no text content/);
  });
});
