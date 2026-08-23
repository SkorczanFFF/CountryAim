import { useEffect, useRef, useState } from 'react';
import { createDetector, type Scan } from './detector';
import { sourceRect } from './roi';

/**
 * Roughly twelve attempts a second. Decoding every frame gains nothing a hand
 * holding a phone can use, and the phone gets hot enough to throttle the camera
 * long before the user finds the barcode.
 */
const MIN_INTERVAL_MS = 80;

type Schedule = { cancel: () => void };

/**
 * `requestVideoFrameCallback` fires once per decoded frame, which is exactly the
 * cadence wanted; Firefox has no such thing, so it falls back to animation
 * frames. Both stop on their own when the tab is hidden.
 */
function scheduler(video: HTMLVideoElement, tick: () => void): Schedule {
  if ('requestVideoFrameCallback' in video) {
    const id = video.requestVideoFrameCallback(() => tick());
    return { cancel: () => video.cancelVideoFrameCallback(id) };
  }
  const id = requestAnimationFrame(() => tick());
  return { cancel: () => cancelAnimationFrame(id) };
}

export function useScanLoop(
  video: HTMLVideoElement | null,
  onScan: (scan: Scan) => void,
): 'native' | 'wasm' | undefined {
  const [backend, setBackend] = useState<'native' | 'wasm'>();
  const onScanRef = useRef(onScan);
  onScanRef.current = onScan;

  useEffect(() => {
    if (!video) return;

    let stopped = false;
    let pending: Schedule | undefined;
    let detector: Awaited<ReturnType<typeof createDetector>> | undefined;
    let lastAttempt = 0;
    let busy = false;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });

    createDetector().then((ready) => {
      if (stopped) return;
      detector = ready;
      setBackend(ready.backend);
    });

    const tick = () => {
      if (stopped) return;
      pending = scheduler(video, tick);

      const now = performance.now();
      // Skipping while a decode is in flight matters more than the interval:
      // a slow wasm frame would otherwise queue up behind itself.
      if (
        busy ||
        !detector ||
        !context ||
        now - lastAttempt < MIN_INTERVAL_MS
      ) {
        return;
      }

      const rect = sourceRect(video, {
        width: video.clientWidth,
        height: video.clientHeight,
      });
      if (!rect) return;

      lastAttempt = now;
      busy = true;
      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
      context.drawImage(
        video,
        rect.x,
        rect.y,
        rect.width,
        rect.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      detector
        .detect(canvas)
        .then(([scan]) => {
          if (!stopped && scan) onScanRef.current(scan);
        })
        .catch(() => {})
        .finally(() => {
          busy = false;
        });
    };

    tick();

    return () => {
      stopped = true;
      pending?.cancel();
    };
  }, [video]);

  return backend;
}
