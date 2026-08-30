import { afterEach, describe, expect, it, vi } from 'vitest';
import { captureStill, STILL } from '~/scanner/freeze';
import { ROI, sourceRect } from '~/scanner/roi';

function video(videoWidth = 1280, videoHeight = 720) {
  return {
    videoWidth,
    videoHeight,
    clientWidth: 360,
    clientHeight: 640,
  } as HTMLVideoElement;
}

function stubCanvas() {
  const context = { drawImage: vi.fn() };
  const canvas = {
    width: 0,
    height: 0,
    getContext: () => context,
    toBlob: (done: BlobCallback) => done(new Blob(['jpeg'])),
  };
  vi.spyOn(document, 'createElement').mockReturnValue(
    canvas as unknown as HTMLElement,
  );
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:still');
  return { canvas, context };
}

afterEach(() => {
  vi.restoreAllMocks();
});

const displayed = { width: 360, height: 640 };

describe('STILL', () => {
  it('takes in more than the strip that was decoded', () => {
    // The band is a slice across the middle of the bars. A picture of only that
    // is a picture of a barcode, which the readout has already told the user.
    const band = sourceRect(video(), displayed, ROI);
    const still = sourceRect(video(), displayed, STILL);

    expect(still?.height).toBeGreaterThan((band?.height ?? 0) * 2.5);
    expect(still?.width).toBeGreaterThan(band?.width ?? 0);
  });

  it('survives the second crop the preview puts it through', () => {
    // The still goes into an element the shape of the preview under
    // `object-fit: cover`, so whatever was kept on only one axis is cropped away
    // again and the screen gets the smaller fraction on both. Below the band's
    // own width that takes the ends off the code the reading came from.
    expect(Math.min(STILL.width, STILL.height)).toBeGreaterThan(ROI.width);
  });

  it('shares its centre with the band, so the code sits in the middle', () => {
    const band = sourceRect(video(), displayed, ROI);
    const still = sourceRect(video(), displayed, STILL);

    expect((still?.x ?? 0) + (still?.width ?? 0) / 2).toBeCloseTo(
      (band?.x ?? 0) + (band?.width ?? 0) / 2,
      5,
    );
    expect((still?.y ?? 0) + (still?.height ?? 0) / 2).toBeCloseTo(
      (band?.y ?? 0) + (band?.height ?? 0) / 2,
      5,
    );
  });
});

describe('captureStill', () => {
  it('draws the still region and hands back a url for it', async () => {
    const { canvas, context } = stubCanvas();
    const source = video();
    const rect = sourceRect(source, displayed, STILL);

    await expect(captureStill(source)).resolves.toBe('blob:still');

    expect(canvas.width).toBe(Math.round(rect?.width ?? 0));
    expect(canvas.height).toBe(Math.round(rect?.height ?? 0));
    expect(context.drawImage).toHaveBeenCalledWith(
      source,
      rect?.x,
      rect?.y,
      rect?.width,
      rect?.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
  });

  it('gives up until the video reports its size', async () => {
    stubCanvas();

    await expect(captureStill(video(0, 0))).resolves.toBeUndefined();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });
});
