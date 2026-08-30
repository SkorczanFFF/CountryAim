import { type Box, sourceRect } from './roi';

/**
 * How much of the preview the still keeps.
 *
 * One number on both axes, and it has to stay one. The still is shown in the
 * element the preview filled, under the same `object-fit: cover`, so a box cut
 * further on one axis than the other has the difference encoded into the JPEG
 * and then thrown away again by that crop: what reaches the screen is the
 * smaller of the two fractions, on both axes.
 *
 * Which makes the read band the floor. It is 0.86 wide and it is where the
 * reading came from, so a still cut inside it would lose the ends of the very
 * code it exists to be proof of. What is left over is a small step in — enough
 * to say the frame stopped, not enough to crop the evidence.
 */
const KEEP = 0.9;

export const STILL: Box = { width: KEEP, height: KEEP };

/** A photograph, shown once and thrown away on close: JPEG, not PNG. */
const QUALITY = 0.85;

/**
 * The frame as it was at the moment of the reading, as an object URL.
 *
 * The caller owns the URL and has to revoke it. Every reading makes one of
 * these, and a phone in a shop aisle makes a lot of readings.
 */
export function captureStill(
  video: HTMLVideoElement,
): Promise<string | undefined> {
  const rect = sourceRect(
    video,
    { width: video.clientWidth, height: video.clientHeight },
    STILL,
  );
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!rect || !context) return Promise.resolve(undefined);

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

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob ? URL.createObjectURL(blob) : undefined),
      'image/jpeg',
      QUALITY,
    );
  });
}
