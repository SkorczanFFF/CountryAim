import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '~/App';
import type { Scan } from '~/scanner/detector';

/**
 * The loop and the capture are stubbed so a reading can be handed to the app
 * directly. Everything between a camera frame and a `Scan` has its own tests;
 * what is worth proving here is what the app does once one arrives.
 */
const loop = vi.hoisted(() => ({
  video: null as HTMLVideoElement | null,
  onScan: undefined as ((scan: Scan) => void) | undefined,
  paused: false,
}));

vi.mock('~/scanner/useScanLoop', () => ({
  useScanLoop: (
    video: HTMLVideoElement | null,
    onScan: (scan: Scan) => void,
    paused: boolean,
  ) => {
    loop.video = video;
    loop.onScan = onScan;
    loop.paused = paused;
    return 'native';
  },
}));

vi.mock('~/scanner/freeze', () => ({
  captureStill: vi.fn(() => Promise.resolve('blob:still')),
}));

function withoutCamera() {
  Object.defineProperty(window, 'isSecureContext', {
    value: true,
    configurable: true,
  });
  Object.defineProperty(navigator, 'mediaDevices', {
    value: undefined,
    configurable: true,
  });
}

function withCamera() {
  // A real MediaStream: the srcObject setter rejects anything else, so a plain
  // object never gets as far as the preview mounting.
  const stream = new MediaStream();
  stream.getTracks = () => [];
  Object.defineProperty(window, 'isSecureContext', {
    value: true,
    configurable: true,
  });
  Object.defineProperty(navigator, 'mediaDevices', {
    value: { getUserMedia: () => Promise.resolve(stream) },
    configurable: true,
  });
}

async function scan(value: string, format: Scan['format'] = 'ean_13') {
  // The preview mounts a render before the app is handed the element, and only
  // the callback from that later render can take a still. Waiting on the video
  // the loop was given picks up the right one.
  await waitFor(() => expect(loop.video).not.toBeNull());
  await act(async () => {
    loop.onScan?.({ value, format });
    // The capture is a promise. Letting it settle inside act means the state it
    // sets is committed before the test asserts anything.
    await new Promise((settle) => setTimeout(settle, 0));
  });
}

beforeEach(() => {
  // The holder outlives each render, so a stale element from the last test
  // would satisfy the wait before this one has mounted anything.
  loop.video = null;
  loop.onScan = undefined;
  loop.paused = false;
});

afterEach(() => {
  // `captureStill` is a module mock, so restoring spies leaves its call log
  // standing and the next test reads the last test's capture as its own.
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('App', () => {
  it('says why the camera did not start', () => {
    withoutCamera();
    render(<App />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'CountryAim',
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Ta przeglądarka nie udostępnia kamery.',
    );
  });

  it('falls back to the capability probe when the camera fails', () => {
    withoutCamera();
    render(<App />);

    expect(screen.getAllByRole('listitem')).toHaveLength(11);
  });

  it('stamps the build version over the camera', async () => {
    withCamera();
    render(<App />);
    await waitFor(() => expect(loop.video).not.toBeNull());

    // This lived only in the branch that renders when the camera fails, so the
    // one screen people actually test on could not say which build it was. The
    // deploy is a single address overwritten in place, which makes the version
    // the only thing that tells a fresh build from a cached one.
    expect(screen.getByText(`v${__APP_VERSION__}`)).toBeInTheDocument();
  });

  it('freezes the frame and names the issuer on a reading that checks out', async () => {
    withCamera();
    render(<App />);
    await scan('5901234123457');

    expect(document.querySelector('img[src="blob:still"]')).toBeInTheDocument();
    expect(screen.getByText('Polska')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zamknij' })).toBeInTheDocument();
    // The stream is untouched; only decoding stops, so coming back is instant.
    expect(loop.paused).toBe(true);
  });

  it('says the country is a registration and not an origin', async () => {
    withCamera();
    render(<App />);
    await scan('5901234123457');

    // §2. A country's name under a barcode is read as "made there"; this is the
    // sentence that stops it, and it is on screen from the moment the name is
    // rather than behind something the user has to open.
    expect(
      screen.getByText('To kraj rejestracji numeru, nie miejsce produkcji.'),
    ).toBeInTheDocument();
  });

  it('leaves the disclaimer off a range that names no country', async () => {
    withCamera();
    render(<App />);
    await scan('9780306406157');

    // An ISBN carries no country to be mistaken for an origin, so correcting one
    // would be noise. The flag stays away for the same reason.
    expect(screen.getByText('Książka (ISBN)')).toBeInTheDocument();
    expect(screen.queryByText(/kraj rejestracji/)).toBeNull();
  });

  it('keeps scanning when the check digit does not add up', async () => {
    const { captureStill } = await import('~/scanner/freeze');
    withCamera();
    render(<App />);
    await scan('5901234123456');

    expect(captureStill).not.toHaveBeenCalled();
    expect(screen.getByText('Skieruj aparat na kod kreskowy')).toBeVisible();
    expect(loop.paused).toBe(false);
  });

  it('lets the still go when the reading is closed', async () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL');
    withCamera();
    render(<App />);
    await scan('5901234123457');

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Zamknij' }));
    });

    expect(revoke).toHaveBeenCalledWith('blob:still');
    expect(document.querySelector('img[src="blob:still"]')).toBeNull();
    expect(loop.paused).toBe(false);
  });
});
