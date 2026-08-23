import { describe, expect, it } from 'vitest';
import { FLAG_URLS, flagUrl } from '~/components/Flags/flagUrls';

describe('flagUrls', () => {
  it('resolves the whole set at build time', () => {
    expect(Object.keys(FLAG_URLS).length).toBeGreaterThan(200);
  });

  it('looks a code up whichever case it arrives in', () => {
    expect(flagUrl('PL')).toBeDefined();
    expect(flagUrl('pl')).toBe(flagUrl('PL'));
  });

  it('has a flag for Kosovo, which is not an ISO 3166-1 code', () => {
    expect(flagUrl('XK')).toBeDefined();
  });

  it('gives nothing for a code with no flag', () => {
    expect(flagUrl('QQ')).toBeUndefined();
  });
});
