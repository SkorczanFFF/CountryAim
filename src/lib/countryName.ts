import type { Locale } from './locale';

/**
 * Names come from the platform's CLDR data rather than a table of our own, which
 * is what keeps a new language at roughly ten interface strings instead of a
 * hundred and thirty country names.
 *
 * `style: 'long'` is deliberate. `short` would turn "SRA Hongkong (Chiny)" into
 * "Hongkong", but it also shortens "Wielka Brytania" to "Wlk. Bryt." and "Stany
 * Zjednoczone" to "USA" — a bad trade, since those two prefixes are common and
 * Hong Kong's is not.
 */
export function countryName(iso: string, locale: Locale): string {
  return new Intl.DisplayNames([locale], { type: 'region' }).of(iso) ?? iso;
}

/**
 * Joins the countries of a member organisation that covers several, e.g.
 * "Belgia i Luksemburg". `Intl.ListFormat` supplies the conjunction and the
 * comma rules, so a multi-country range costs no translated text at all.
 */
export function regionName(isos: readonly string[], locale: Locale): string {
  return new Intl.ListFormat(locale, {
    style: 'long',
    type: 'conjunction',
  }).format(isos.map((iso) => countryName(iso, locale)));
}
