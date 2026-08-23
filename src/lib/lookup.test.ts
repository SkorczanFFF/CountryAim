import { describe, expect, it } from 'vitest';
import { type BarcodeFormat, parseGtin } from '~/lib/gtin';
import { lookupPrefix } from '~/lib/lookup';

/** Runs a printed barcode through the whole chain, the way the scanner will. */
function scan(raw: string, format: BarcodeFormat) {
  const parsed = parseGtin(raw, format);
  if (!parsed.ok) throw new Error(`expected a valid GTIN, got ${parsed.error}`);
  return lookupPrefix(parsed.value.prefixSource);
}

describe('lookupPrefix', () => {
  it('resolves the boundaries around an assigned prefix', () => {
    expect(lookupPrefix('5890000000000')).toBeUndefined();
    expect(lookupPrefix('5900000000000')).toMatchObject({ iso: 'PL' });
    expect(lookupPrefix('5910000000000')).toBeUndefined();
  });

  it('separates ISMN from the ISBN range around it', () => {
    expect(lookupPrefix('9789000000000')).toMatchObject({ key: 'isbn' });
    expect(lookupPrefix('9790000000000')).toMatchObject({ key: 'ismn' });
    expect(lookupPrefix('9791000000000')).toMatchObject({ key: 'isbn' });
  });

  it('splits the GTIN-8 pool between its three organisations', () => {
    expect(lookupPrefix('96240000')).toMatchObject({ iso: 'GB' });
    expect(lookupPrefix('96250000')).toMatchObject({ iso: 'PL' });
    expect(lookupPrefix('96270000')).toMatchObject({ key: 'gs1GlobalOffice' });
  });
});

describe('lookupPrefix, from a scanned barcode', () => {
  it('names the issuing organisation for each supported format', () => {
    expect(scan('5901234123457', 'ean_13')).toMatchObject({
      kind: 'country',
      iso: 'PL',
    });
    expect(scan('012345678905', 'upc_a')).toMatchObject({
      kind: 'country',
      iso: 'US',
    });
    expect(scan('04252614', 'upc_e')).toMatchObject({
      kind: 'country',
      iso: 'US',
    });
  });

  it('reads an EAN-8 prefix from the code itself, not from the padding', () => {
    // gtin14 would be 00000059012344, whose prefix reads as 000: the United
    // States. prefixSource keeps the 590 that Poland actually issued.
    expect(scan('59012344', 'ean_8')).toMatchObject({
      kind: 'country',
      iso: 'PL',
    });
  });

  it('answers with a purpose where the range is not a country', () => {
    expect(scan('9781234567897', 'ean_13')).toMatchObject({
      kind: 'special',
      key: 'isbn',
    });
    expect(scan('2012345678903', 'ean_13')).toMatchObject({
      kind: 'special',
      key: 'restrictedDistribution',
    });
  });

  it('reports a multi-country range as a region', () => {
    expect(scan('3001234567892', 'ean_13')).toMatchObject({
      kind: 'region',
      isos: ['FR', 'MC'],
    });
  });
});
