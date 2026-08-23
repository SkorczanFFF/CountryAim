import { describe, expect, it } from 'vitest';
import { parseGtin } from '~/lib/gtin';

function parsed(raw: string, format: Parameters<typeof parseGtin>[1]) {
  const result = parseGtin(raw, format);
  if (!result.ok) throw new Error(`expected a valid GTIN, got ${result.error}`);
  return result.value;
}

describe('parseGtin', () => {
  it('pads an EAN-13 to GTIN-14 and keeps all 13 digits for the prefix', () => {
    expect(parsed('5901234123457', 'ean_13')).toEqual({
      format: 'ean_13',
      gtin14: '05901234123457',
      prefixSource: '5901234123457',
    });
  });

  it('reads a UPC-A prefix as a leading-zero EAN-13', () => {
    expect(parsed('036000291452', 'upc_a')).toEqual({
      format: 'upc_a',
      gtin14: '00036000291452',
      prefixSource: '0036000291452',
    });
  });

  it('expands a UPC-E before validating it', () => {
    expect(parsed('04252614', 'upc_e')).toEqual({
      format: 'upc_e',
      gtin14: '00042100005264',
      prefixSource: '0042100005264',
    });
  });

  it('keeps an EAN-8 prefix out of the zero padding', () => {
    const { gtin14, prefixSource } = parsed('59012344', 'ean_8');

    expect(gtin14).toBe('00000059012344');
    // Reading the prefix off gtin14 would give 000 (United States) instead of
    // 590. This is the whole reason prefixSource exists.
    expect(prefixSource).toBe('59012344');
  });

  it('rejects eight digits read as the wrong one of the two 8-digit formats', () => {
    expect(parseGtin('59012344', 'upc_e')).toEqual({
      ok: false,
      error: 'check-digit',
    });
    expect(parseGtin('04252614', 'ean_8')).toEqual({
      ok: false,
      error: 'check-digit',
    });
  });

  it('rejects a wrong check digit', () => {
    expect(parseGtin('5901234123456', 'ean_13')).toEqual({
      ok: false,
      error: 'check-digit',
    });
  });

  it('rejects non-digits and wrong lengths', () => {
    expect(parseGtin('590123412345X', 'ean_13')).toEqual({
      ok: false,
      error: 'not-digits',
    });
    expect(parseGtin('590123412345', 'ean_13')).toEqual({
      ok: false,
      error: 'wrong-length',
    });
  });
});
