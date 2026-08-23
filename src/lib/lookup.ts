import { GS1_PREFIX_RANGES, type PrefixRange } from './gs1Prefixes';

/**
 * Resolves the digits a GTIN carries its GS1 prefix in — `Gtin.prefixSource`,
 * never `gtin14` — to the range that issued it. `undefined` means the prefix is
 * unassigned, which is a normal answer rather than an error: GS1 hands out new
 * prefixes over time, and misread or non-standard codes reach here too.
 */
export function lookupPrefix(prefixSource: string): PrefixRange | undefined {
  // Four digits, not the three a GS1 prefix is usually printed as; gs1Prefixes.ts
  // explains why the table needs the extra one.
  const key = Number(prefixSource.slice(0, 4));

  // A linear scan over ~140 non-overlapping ranges, run once per successful scan
  // rather than per frame, so a binary search would optimise nothing measurable
  // while adding boundary cases to get wrong.
  return GS1_PREFIX_RANGES.find(
    (range) => key >= range.from && key <= range.to,
  );
}
