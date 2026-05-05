import { describe, it, expect, vi } from 'vitest';
import { UploadScreen } from '../src/screens/upload-screen.js';

describe('UploadScreen', () => {
  function makeScreen(): UploadScreen {
    return new UploadScreen();
  }

  it('starts with no image and empty note', () => {
    const screen = makeScreen();
    expect(screen.imageUrl).toBeNull();
    expect(screen.note).toBe('');
  });

  it('canSubmit is false when no image', () => {
    const screen = makeScreen();
    screen.note = 'A long enough note to trigger submission here yes';
    expect(screen.canSubmit).toBe(false);
  });

  it('canSubmit is false when note is too short', () => {
    const screen = makeScreen();
    screen.imageUrl = 'blob:test';
    screen.note = 'short';
    expect(screen.canSubmit).toBe(false);
  });

  it('canSubmit is true when image and note are set', () => {
    const screen = makeScreen();
    screen.imageUrl = 'blob:test';
    screen.note = 'A long enough note that exceeds ten characters easily';
    expect(screen.canSubmit).toBe(true);
  });

  it('handleSubmit calls onSubmit with image and note', () => {
    const screen = makeScreen();
    screen.imageUrl = 'blob:test';
    screen.note = 'My wonderful nature note that is long enough yes';
    const onSubmit = vi.fn();
    screen.onSubmit = onSubmit;
    screen.handleSubmit();
    expect(onSubmit).toHaveBeenCalledWith({
      imageUrl: 'blob:test',
      note: screen.note,
    });
  });

  it('handleSubmit does nothing when canSubmit is false', () => {
    const screen = makeScreen();
    const onSubmit = vi.fn();
    screen.onSubmit = onSubmit;
    screen.handleSubmit();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('handleDemo calls onSubmit with demo data', () => {
    const screen = makeScreen();
    const onSubmit = vi.fn();
    screen.onSubmit = onSubmit;
    screen.handleDemo();
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        note: expect.stringContaining('Torridon'),
      }),
    );
  });
});
