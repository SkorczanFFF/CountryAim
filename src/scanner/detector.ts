import type { BarcodeFormat } from '~/lib/gtin';

/** Product symbologies only. A QR code on a packet is never the article number. */
const FORMATS: readonly BarcodeFormat[] = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];

export type Scan = { value: string; format: BarcodeFormat };

export type Detector = {
  /** Which implementation answered, which is the first thing worth knowing when a device will not scan. */
  backend: 'native' | 'wasm';
  detect(source: ImageBitmapSource): Promise<Scan[]>;
};

type NativeDetector = {
  detect(
    source: ImageBitmapSource,
  ): Promise<{ rawValue: string; format: string }[]>;
};

type NativeConstructor = {
  new (options: { formats: readonly string[] }): NativeDetector;
  getSupportedFormats(): Promise<string[]>;
};

function isFormat(value: string): value is BarcodeFormat {
  return (FORMATS as readonly string[]).includes(value);
}

/**
 * Backends disagree about UPC-E: some hand back the eight compressed digits,
 * others the twelve they expand to. Twelve digits *are* a UPC-A, so relabel
 * rather than teach the parser a second shape — hiding this difference is what
 * an adapter is for.
 */
function normalise(rawValue: string, format: string): Scan | undefined {
  if (!isFormat(format)) return undefined;
  if (format === 'upc_e' && rawValue.length === 12) {
    return { value: rawValue, format: 'upc_a' };
  }
  return { value: rawValue, format };
}

async function nativeDetector(): Promise<Detector | undefined> {
  const Native = (globalThis as { BarcodeDetector?: NativeConstructor })
    .BarcodeDetector;
  if (!Native) return undefined;

  try {
    // Chrome ships the constructor on platforms where it decodes nothing, so
    // the format list is the real test of whether it is usable.
    const supported = await Native.getSupportedFormats();
    if (!FORMATS.every((format) => supported.includes(format)))
      return undefined;
  } catch {
    return undefined;
  }

  const detector = new Native({ formats: FORMATS });
  return {
    backend: 'native',
    detect: async (source) =>
      (await detector.detect(source))
        .map(({ rawValue, format }) => normalise(rawValue, format))
        .filter((scan): scan is Scan => scan !== undefined),
  };
}

async function wasmDetector(): Promise<Detector> {
  const [{ BarcodeDetector, setZXingModuleOverrides }, { default: wasmUrl }] =
    await Promise.all([
      import('barcode-detector/pure'),
      // Self-hosted on purpose: the library otherwise pulls its 1 MB binary from
      // jsdelivr, which would tell a third party every time someone scans, and
      // would leave the scanner dead offline and during any CDN outage.
      import('zxing-wasm/reader/zxing_reader.wasm?url'),
    ]);

  setZXingModuleOverrides({ locateFile: () => wasmUrl });

  const detector = new BarcodeDetector({ formats: [...FORMATS] });
  return {
    backend: 'wasm',
    detect: async (source) =>
      (await detector.detect(source))
        .map(({ rawValue, format }) => normalise(rawValue, format))
        .filter((scan): scan is Scan => scan !== undefined),
  };
}

/**
 * Prefers the platform decoder and falls back to the WebAssembly one, which is
 * loaded only if it is needed — Safari and Firefox pay for the binary, Android
 * Chrome does not.
 */
export function createDetector(): Promise<Detector> {
  return nativeDetector().then((native) => native ?? wasmDetector());
}
