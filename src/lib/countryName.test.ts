import { describe, expect, it } from 'vitest';
import { countryName, regionName } from '~/lib/countryName';
import { parseGtin } from '~/lib/gtin';
import { lookupPrefix } from '~/lib/lookup';

describe('countryName', () => {
  it('reads names from the platform, in both languages', () => {
    expect(countryName('PL', 'pl')).toBe('Polska');
    expect(countryName('PL', 'en')).toBe('Poland');
    expect(countryName('FR', 'pl')).toBe('Francja');
  });

  it('knows Kosovo, which is why no override table exists', () => {
    // XK is not an ISO 3166-1 code, so the plan assumed it would need one.
    // CLDR carries it anyway; if a browser ever does not, this test says so.
    expect(countryName('XK', 'pl')).toBe('Kosowo');
    expect(countryName('XK', 'en')).toBe('Kosovo');
  });

  it('falls back to the code for an unknown region, but not for a malformed one', () => {
    expect(countryName('QQ', 'en')).toBe('QQ');
    // Documented, not guarded: every code reaching here comes from the prefix
    // table, whose shape is asserted in gs1Prefixes.test.ts.
    expect(() => countryName('Z1', 'en')).toThrow(RangeError);
  });
});

describe('regionName', () => {
  it('joins two countries with the right conjunction per language', () => {
    expect(regionName(['BE', 'LU'], 'pl')).toBe('Belgia i Luksemburg');
    expect(regionName(['BE', 'LU'], 'en')).toBe('Belgium and Luxembourg');
  });

  it('handles three countries, including the comma rules', () => {
    expect(regionName(['IT', 'SM', 'VA'], 'pl')).toBe(
      'Włochy, San Marino i Watykan',
    );
    expect(regionName(['IT', 'SM', 'VA'], 'en')).toBe(
      'Italy, San Marino, and Vatican City',
    );
  });

  it('leaves a single country alone', () => {
    expect(regionName(['PL'], 'pl')).toBe('Polska');
  });
});

describe('naming what a scanned barcode resolves to', () => {
  function name(raw: string, locale: 'pl' | 'en') {
    const parsed = parseGtin(raw, 'ean_13');
    if (!parsed.ok) throw new Error(`invalid test barcode: ${parsed.error}`);

    const range = lookupPrefix(parsed.value.prefixSource);
    if (range?.kind === 'country') return countryName(range.iso, locale);
    if (range?.kind === 'region') return regionName(range.isos, locale);
    return undefined;
  }

  it('carries a code through to a name a person can read', () => {
    expect(name('5901234123457', 'pl')).toBe('Polska');
    expect(name('5901234123457', 'en')).toBe('Poland');
    expect(name('3001234567892', 'pl')).toBe('Francja i Monako');
  });

  it('has no name for a range that is not a country', () => {
    expect(name('9781234567897', 'pl')).toBeUndefined();
  });
});
