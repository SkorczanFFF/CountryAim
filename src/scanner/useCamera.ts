import { useEffect, useState } from 'react';

export type CameraErrorReason =
  | 'insecure'
  | 'unsupported'
  | 'denied'
  | 'notFound'
  | 'notReadable'
  | 'overconstrained'
  | 'unknown';

export type CameraState =
  | { status: 'starting' }
  | { status: 'ready'; stream: MediaStream }
  | { status: 'error'; reason: CameraErrorReason };

/**
 * `facingMode` is a preference rather than `{ exact: 'environment' }`: exact
 * throws on any device without a rear camera, which would make the app
 * untestable on a laptop for no gain — a phone still picks the rear camera.
 *
 * No resolution is requested yet. The default may well be too coarse to decode
 * a barcode at arm's length, but asking for more costs battery and heat, and
 * there is nothing to tune against until the scan loop can measure a hit rate.
 */
const CONSTRAINTS: MediaStreamConstraints = {
  video: { facingMode: 'environment' },
  audio: false,
};

/**
 * Read `name` by shape rather than `instanceof`: `OverconstrainedError` is not a
 * DOMException everywhere, and this is the one place where being wrong shows up
 * only on someone else's phone.
 */
function toReason(error: unknown): CameraErrorReason {
  const name =
    typeof error === 'object' && error !== null && 'name' in error
      ? String((error as { name: unknown }).name)
      : '';

  switch (name) {
    case 'NotAllowedError':
    case 'SecurityError':
      return 'denied';
    case 'NotFoundError':
      return 'notFound';
    case 'NotReadableError':
      return 'notReadable';
    case 'OverconstrainedError':
      return 'overconstrained';
    default:
      return 'unknown';
  }
}

function stop(stream: MediaStream): void {
  for (const track of stream.getTracks()) track.stop();
}

export function useCamera(): CameraState {
  const [state, setState] = useState<CameraState>({ status: 'starting' });

  useEffect(() => {
    // An insecure origin hides mediaDevices entirely, so check the context first
    // to say "needs HTTPS" instead of "not supported".
    if (!window.isSecureContext) {
      setState({ status: 'error', reason: 'insecure' });
      return;
    }
    if (typeof navigator.mediaDevices?.getUserMedia !== 'function') {
      setState({ status: 'error', reason: 'unsupported' });
      return;
    }

    let cancelled = false;
    let opened: MediaStream | undefined;

    navigator.mediaDevices
      .getUserMedia(CONSTRAINTS)
      .then((stream) => {
        // StrictMode unmounts and remounts before this resolves. Without this
        // branch the first stream is never stopped and the camera light stays
        // on for the rest of the session.
        if (cancelled) {
          stop(stream);
          return;
        }
        opened = stream;
        setState({ status: 'ready', stream });
      })
      .catch((error: unknown) => {
        if (!cancelled) setState({ status: 'error', reason: toReason(error) });
      });

    return () => {
      cancelled = true;
      if (opened) stop(opened);
    };
  }, []);

  return state;
}
