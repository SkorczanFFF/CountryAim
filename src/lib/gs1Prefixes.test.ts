import { describe, expect, it } from 'vitest';
import { GS1_PREFIX_RANGES } from '~/lib/gs1Prefixes';

function at(key: number) {
  return GS1_PREFIX_RANGES.find(
    (range) => key >= range.from && key <= range.to,
  );
}

describe('GS1_PREFIX_RANGES', () => {
  // Nothing else guards a hand-transcribed table: a wrong ISO code is
  // internally consistent and simply shows the wrong country.
  it('is sorted and never overlaps', () => {
    for (let i = 1; i < GS1_PREFIX_RANGES.length; i += 1) {
      const previous = GS1_PREFIX_RANGES[i - 1];
      const current = GS1_PREFIX_RANGES[i];
      if (!previous || !current) throw new Error('unreachable');

      expect(current.from).toBeGreaterThan(previous.to);
    }
  });

  it('keeps every bound inside the four-digit space', () => {
    for (const range of GS1_PREFIX_RANGES) {
      expect(range.from).toBeGreaterThanOrEqual(0);
      expect(range.to).toBeLessThanOrEqual(9999);
      expect(range.to).toBeGreaterThanOrEqual(range.from);
    }
  });

  it('uses well-formed ISO codes, and regions only where there are several', () => {
    for (const range of GS1_PREFIX_RANGES) {
      if (range.kind === 'country') expect(range.iso).toMatch(/^[A-Z]{2}$/);
      if (range.kind === 'region') {
        expect(range.isos.length).toBeGreaterThan(1);
        for (const iso of range.isos) expect(iso).toMatch(/^[A-Z]{2}$/);
      }
    }
  });

  it('resolves the prefixes the rest of the app is built around', () => {
    expect(at(5901)).toMatchObject({ kind: 'country', iso: 'PL' });
    expect(at(3000)).toMatchObject({ kind: 'region', isos: ['FR', 'MC'] });
    expect(at(9770)).toMatchObject({ kind: 'special', key: 'issn' });
  });

  it('splits the GTIN-8 pool and the ISBN range at four digits', () => {
    expect(at(9624)).toMatchObject({ kind: 'country', iso: 'GB' });
    expect(at(9625)).toMatchObject({ kind: 'country', iso: 'PL' });
    expect(at(9627)).toMatchObject({ kind: 'special', key: 'gs1GlobalOffice' });

    expect(at(9789)).toMatchObject({ kind: 'special', key: 'isbn' });
    expect(at(9790)).toMatchObject({ kind: 'special', key: 'ismn' });
    expect(at(9791)).toMatchObject({ kind: 'special', key: 'isbn' });
  });

  it('leaves unassigned prefixes unassigned', () => {
    // 000 is held back so a GTIN-8 cannot collide with a zero-padded GTIN-13,
    // and 390 is the gap that older lists wrongly give to Kosovo.
    expect(at(9)).toBeUndefined();
    expect(at(3900)).toBeUndefined();
    expect(at(9840)).toBeUndefined();
  });
});
