import { describe, expect, it } from 'vitest';
import { ROI, sourceRect } from '~/scanner/roi';

function video(videoWidth: number, videoHeight: number) {
  return { videoWidth, videoHeight } as HTMLVideoElement;
}

describe('sourceRect', () => {
  it('reads the middle of the frame when nothing is cropped away', () => {
    const rect = sourceRect(video(1000, 1000), { width: 500, height: 500 });

    expect(rect).toEqual({ x: 70, y: 370, width: 860, height: 260 });
  });

  it('stays inside what the viewer can actually see', () => {
    // A landscape camera in a portrait phone: object-fit cover fills the height
    // and throws away most of the width, so only 405 of the 1280 source columns
    // are on screen. Taking 86% of the source instead of 86% of the view would
    // read 1101 columns — a barcode could be decoded far outside the frame the
    // mask is drawing.
    const rect = sourceRect(video(1280, 720), { width: 360, height: 640 });
    const visibleSourceWidth = 360 / (640 / 720);

    expect(rect?.width).toBeLessThan(visibleSourceWidth);
    expect(rect?.width).toBeCloseTo(visibleSourceWidth * ROI.width, 5);
    expect(rect?.x).toBeCloseTo((1280 - (rect?.width ?? 0)) / 2, 5);
  });

  it('never asks for more than the frame holds', () => {
    const rect = sourceRect(video(640, 480), { width: 2000, height: 100 });

    expect(rect?.width).toBeLessThanOrEqual(640);
    expect(rect?.height).toBeLessThanOrEqual(480);
  });

  it('gives up until the video reports its size', () => {
    expect(
      sourceRect(video(0, 0), { width: 360, height: 640 }),
    ).toBeUndefined();
    expect(
      sourceRect(video(1280, 720), { width: 0, height: 0 }),
    ).toBeUndefined();
  });
});
