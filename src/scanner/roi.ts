/**
 * The band the scanner reads, as a fraction of the *displayed* preview. A
 * barcode is wide and short, so a narrow horizontal strip both decodes faster
 * and stops a second code elsewhere in frame from winning.
 */
export const ROI = { width: 0.86, height: 0.26 } as const;

export type SourceRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Maps the band from what the viewer sees back to camera pixels.
 *
 * The preview is drawn with `object-fit: cover`, so the element shows a centre
 * crop of the frame rather than the whole of it. Cropping the source by the same
 * fractions would read a region wider than anything on screen, and the mask
 * would be pointing at the wrong place. Both boxes share a centre, which is what
 * keeps this to a scale factor.
 */
export function sourceRect(
  video: HTMLVideoElement,
  displayed: { width: number; height: number },
): SourceRect | undefined {
  const { videoWidth, videoHeight } = video;
  if (!videoWidth || !videoHeight || !displayed.width || !displayed.height) {
    return undefined;
  }

  const scale = Math.max(
    displayed.width / videoWidth,
    displayed.height / videoHeight,
  );
  const width = Math.min(videoWidth, (displayed.width * ROI.width) / scale);
  const height = Math.min(videoHeight, (displayed.height * ROI.height) / scale);

  return {
    x: (videoWidth - width) / 2,
    y: (videoHeight - height) / 2,
    width,
    height,
  };
}
