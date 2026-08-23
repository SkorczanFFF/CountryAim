import { countryName, regionName } from '~/lib/countryName';
import { type BarcodeFormat, parseGtin } from '~/lib/gtin';
import { lookupPrefix } from '~/lib/lookup';
import type { Scan } from '~/scanner/detector';
import { LOCALE, t } from './t';

const FORMAT_LABEL: Record<BarcodeFormat, string> = {
  ean_13: 'EAN-13',
  ean_8: 'EAN-8',
  upc_a: 'UPC-A',
  upc_e: 'UPC-E',
};

/**
 * How many of the printed digits carry the GS1 prefix. A UPC-A prints twelve but
 * is read as an EAN-13 with a leading zero, so two of its digits do the work of
 * three; a UPC-E prints its digits compressed, so none of them line up.
 */
function prefixLength(format: BarcodeFormat): number {
  if (format === 'upc_a') return 2;
  if (format === 'upc_e') return 0;
  return 3;
}

export type Reading = {
  /** A country, a shared member organisation, or what the range is for. */
  issuer: string;
  /** Empty where the range is not a country and so has no flag. */
  isos: readonly string[];
  valid: boolean;
  prefix: string;
  rest: string;
  format: string;
};

/** One place where a scan becomes something to put on screen. */
export function describeReading(scan: Scan): Reading {
  const split = prefixLength(scan.format);
  const base = {
    prefix: scan.value.slice(0, split),
    rest: scan.value.slice(split),
    format: FORMAT_LABEL[scan.format],
  };

  const parsed = parseGtin(scan.value, scan.format);
  if (!parsed.ok) {
    return { ...base, issuer: t('readout.invalid'), isos: [], valid: false };
  }

  const range = lookupPrefix(parsed.value.prefixSource);
  if (!range) {
    return { ...base, issuer: t('issuer.unassigned'), isos: [], valid: true };
  }
  if (range.kind === 'country') {
    return {
      ...base,
      issuer: countryName(range.iso, LOCALE),
      isos: [range.iso],
      valid: true,
    };
  }
  if (range.kind === 'region') {
    return {
      ...base,
      issuer: regionName(range.isos, LOCALE),
      isos: range.isos,
      valid: true,
    };
  }
  return { ...base, issuer: t(`issuer.${range.key}`), isos: [], valid: true };
}
