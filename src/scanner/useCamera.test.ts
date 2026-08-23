import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCamera } from '~/scanner/useCamera';

function fakeStream() {
  const track = { stop: vi.fn() };
  const stream = { getTracks: () => [track] } as unknown as MediaStream;
  return { stream, track };
}

function setUp({
  secure = true,
  getUserMedia,
}: {
  secure?: boolean;
  getUserMedia?: () => Promise<MediaStream>;
}) {
  Object.defineProperty(window, 'isSecureContext', {
    value: secure,
    configurable: true,
  });
  Object.defineProperty(navigator, 'mediaDevices', {
    value: getUserMedia ? { getUserMedia } : undefined,
    configurable: true,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useCamera', () => {
  it('hands back the stream once the camera opens', async () => {
    const { stream } = fakeStream();
    setUp({ getUserMedia: () => Promise.resolve(stream) });

    const { result } = renderHook(() => useCamera());

    await waitFor(() =>
      expect(result.current).toEqual({ status: 'ready', stream }),
    );
  });

  it('stops every track on unmount', async () => {
    const { stream, track } = fakeStream();
    setUp({ getUserMedia: () => Promise.resolve(stream) });

    const { result, unmount } = renderHook(() => useCamera());
    await waitFor(() => expect(result.current.status).toBe('ready'));
    unmount();

    expect(track.stop).toHaveBeenCalledTimes(1);
  });

  it('stops a stream that arrives after unmount', async () => {
    // This is the StrictMode double-mount leak: the first effect is torn down
    // before getUserMedia settles, so without the guard nothing ever stops that
    // stream and the camera light stays on for the rest of the session.
    const { stream, track } = fakeStream();
    let open!: (stream: MediaStream) => void;
    const pending = new Promise<MediaStream>((resolve) => {
      open = resolve;
    });
    setUp({ getUserMedia: () => pending });

    const { unmount } = renderHook(() => useCamera());
    unmount();
    await act(async () => {
      open(stream);
      await pending;
    });

    expect(track.stop).toHaveBeenCalledTimes(1);
  });

  it('reads the reason off a rejection', async () => {
    setUp({
      getUserMedia: () =>
        Promise.reject(new DOMException('no', 'NotAllowedError')),
    });

    const { result } = renderHook(() => useCamera());

    await waitFor(() =>
      expect(result.current).toEqual({ status: 'error', reason: 'denied' }),
    );
  });

  it('reads the reason off a rejection that is not a DOMException', async () => {
    // OverconstrainedError is its own interface, not a DOMException everywhere.
    setUp({
      getUserMedia: () =>
        Promise.reject({
          name: 'OverconstrainedError',
          constraint: 'facingMode',
        }),
    });

    const { result } = renderHook(() => useCamera());

    await waitFor(() =>
      expect(result.current).toEqual({
        status: 'error',
        reason: 'overconstrained',
      }),
    );
  });

  it('blames the connection, not the browser, on an insecure origin', async () => {
    const getUserMedia = vi.fn();
    setUp({ secure: false, getUserMedia });

    const { result } = renderHook(() => useCamera());

    expect(result.current).toEqual({ status: 'error', reason: 'insecure' });
    expect(getUserMedia).not.toHaveBeenCalled();
  });

  it('reports an unsupported browser when the API is missing', async () => {
    setUp({});

    const { result } = renderHook(() => useCamera());

    expect(result.current).toEqual({ status: 'error', reason: 'unsupported' });
  });
});
