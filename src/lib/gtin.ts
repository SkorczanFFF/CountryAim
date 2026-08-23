/** The only symbologies the scanner is configured to read. */
export type BarcodeFormat = 'ean_13' | 'ean_8' | 'upc_a' | 'upc_e';

export type Gtin = {
  format: BarcodeFormat;
  /** Zero-padded to 14 digits: the form to compare, de-duplicate and cache on. */
  gtin14: string;
  /**
   * Digits the GS1 prefix is read from. Deliberately not derived from gtin14:
   * padding an EAN-8 out to 14 digits would make its prefix read as 000, the
   * United States, instead of the organisation that actually issued it.
   */
  prefixSource: string;
};

export type GtinError = 'not-digits' | 'wrong-length' | 'check-digit';

export type ParsedGtin =
  | { ok: true; value: Gtin }
  | { ok: false; error: GtinError };

const DIGITS_ONLY = /^\d+$/;

const LENGTHS: Record<BarcodeFormat, number> = {
  ean_13: 13,
  ean_8: 8,
  upc_a: 12,
  upc_e: 8,
};

/**
 * GS1 mod 10. Weights alternate 3 and 1 leftwards from the digit next to the
 * check digit, so right-aligning makes this identical for GTIN-8, -12 and -13.
 */
function computeCheckDigit(body: string): number {
  let sum = 0;
  for (
    let i = body.length - 1, weight = 3;
    i >= 0;
    i -= 1, weight = 4 - weight
  ) {
    sum += (body.charCodeAt(i) - 48) * weight;
  }
  return (10 - (sum % 10)) % 10;
}

/**
 * Restores the zeroes a UPC-E squeezes out. Which zeroes went missing is
 * encoded in the last digit of the body, so the expansion is a lookup, not
 * a padding.
 */
function expandUpcE(upce: string): string {
  const system = upce.slice(0, 1);
  const body = upce.slice(1, 7);
  const check = upce.slice(7, 8);
  const last = body.slice(5, 6);

  switch (last) {
    case '0':
    case '1':
    case '2':
      return `${system}${body.slice(0, 2)}${last}0000${body.slice(2, 5)}${check}`;
    case '3':
      return `${system}${body.slice(0, 3)}00000${body.slice(3, 5)}${check}`;
    case '4':
      return `${system}${body.slice(0, 4)}00000${body.slice(4, 5)}${check}`;
    default:
      return `${system}${body.slice(0, 5)}0000${last}${check}`;
  }
}

/**
 * The format has to come from the detector rather than be guessed from the
 * length: EAN-8 and UPC-E are both eight digits and need opposite handling.
 */
export function parseGtin(raw: string, format: BarcodeFormat): ParsedGtin {
  if (!DIGITS_ONLY.test(raw)) return { ok: false, error: 'not-digits' };
  if (raw.length !== LENGTHS[format])
    return { ok: false, error: 'wrong-length' };

  // A UPC-E check digit belongs to the expanded UPC-A, not to the eight
  // compressed digits, so expanding has to happen before validating.
  const digits = format === 'upc_e' ? expandUpcE(raw) : raw;

  if (computeCheckDigit(digits.slice(0, -1)) !== Number(digits.slice(-1))) {
    return { ok: false, error: 'check-digit' };
  }

  return {
    ok: true,
    value: {
      format,
      gtin14: digits.padStart(14, '0'),
      prefixSource: format === 'ean_8' ? digits : digits.padStart(13, '0'),
    },
  };
}
