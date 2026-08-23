import { afterEach, describe, expect, it, vi } from 'vitest';
import { createDetector } from '~/scanner/detector';

// Only the decoder is faked. The wasm URL import stays real, so this also proves
// the self-hosted asset path resolves rather than silently falling back to a CDN.
const wasmDetect = vi.fn(
  async () => [] as { rawValue: string; format: string }[],
);

vi.mock('barcode-detector/pure', () => ({
  BarcodeDetector: class {
    detect = wasmDetect;
  },
  setZXingModuleOverrides: vi.fn(),
}));

const ALL_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];
const SOURCE = {} as ImageBitmapSource;

function setNative(
  formats: string[],
  results: { rawValue: string; format: string }[] = [],
) {
  Object.defineProperty(globalThis, 'BarcodeDetector', {
    value: class {
      static getSupportedFormats = async () => formats;
      detect = async () => results;
    },
    configurable: true,
  });
}

afterEach(() => {
  Object.defineProperty(globalThis, 'BarcodeDetector', {
    value: undefined,
    configurable: true,
  });
  wasmDetect.mockClear();
});

describe('createDetector', () => {
  it('prefers the platform decoder when it covers every format', async () => {
    setNative(ALL_FORMATS);

    expect((await createDetector()).backend).toBe('native');
  });

  it('falls back when the platform has no decoder at all', async () => {
    expect((await createDetector()).backend).toBe('wasm');
  });

  it('falls back when the constructor exists but decodes nothing', async () => {
    // Chrome ships BarcodeDetector on platforms where the format list is empty,
    // so presence alone is not enough to trust it.
    setNative([]);

    expect((await createDetector()).backend).toBe('wasm');
  });

  it('falls back when only some of the formats are covered', async () => {
    setNative(['ean_13', 'ean_8']);

    expect((await createDetector()).backend).toBe('wasm');
  });
});

describe('a detector, whichever answered', () => {
  it('relabels an expanded UPC-E as the UPC-A it already is', async () => {
    // Backends disagree here: eight compressed digits from one, the twelve they
    // expand to from another. Twelve digits are a UPC-A, so the parser never
    // has to learn a second shape.
    setNative(ALL_FORMATS, [{ rawValue: '042100005264', format: 'upc_e' }]);

    expect(await (await createDetector()).detect(SOURCE)).toEqual([
      { value: '042100005264', format: 'upc_a' },
    ]);
  });

  it('passes a compressed UPC-E through untouched', async () => {
    setNative(ALL_FORMATS, [{ rawValue: '04252614', format: 'upc_e' }]);

    expect(await (await createDetector()).detect(SOURCE)).toEqual([
      { value: '04252614', format: 'upc_e' },
    ]);
  });

  it('drops anything outside the product symbologies', async () => {
    setNative(ALL_FORMATS, [
      { rawValue: 'https://example.test', format: 'qr_code' },
      { rawValue: '5901234123457', format: 'ean_13' },
    ]);

    expect(await (await createDetector()).detect(SOURCE)).toEqual([
      { value: '5901234123457', format: 'ean_13' },
    ]);
  });
});
