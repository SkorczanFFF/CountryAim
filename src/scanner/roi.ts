/** A box as a fraction of the *displayed* preview, sharing its centre. */
export type Box = { readonly width: number; readonly height: number };

/**
 * The band the scanner reads. A barcode is wide and short, so a narrow
 * horizontal strip both decodes faster and stops a second code elsewhere in
 * frame from winning.
 */
export const ROI: Box = { width: 0.86, height: 0.26 };

export type SourceRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Maps a box from what the viewer sees back to camera pixels.
 *
 * The preview is drawn with `object-fit: cover`, so the element shows a centre
 * crop of the frame rather than the whole of it. Cropping the source by the same
 * fractions would read a region wider than anything on screen, and the mask
 * would be pointing at the wrong place. Both boxes share a centre, which is what
 * keeps this to a scale factor.
 *
 * The box is a parameter because the frozen still is cut the same way and only
 * differs in how much it takes; one mapping, two callers.
 */
export function sourceRect(
  video: HTMLVideoElement,
  displayed: { width: number; height: number },
  box: Box = ROI,
): SourceRect | undefined {
  const { videoWidth, videoHeight } = video;
  if (!videoWidth || !videoHeight || !displayed.width || !displayed.height) {
    return undefined;
  }

  const scale = Math.max(
    displayed.width / videoWidth,
    displayed.height / videoHeight,
  );
  const width = Math.min(videoWidth, (displayed.width * box.width) / scale);
  const height = Math.min(videoHeight, (displayed.height * box.height) / scale);

  return {
    x: (videoWidth - width) / 2,
    y: (videoHeight - height) / 2,
    width,
    height,
  };
}
