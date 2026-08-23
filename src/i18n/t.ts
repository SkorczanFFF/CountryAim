import type { Locale } from '~/lib/locale';
import { type MessageKey, pl } from './messages';

/** One place to change when the locale provider lands in M4. */
export const LOCALE: Locale = 'pl';

/**
 * Polish only for now. M4 swaps the body for a locale-aware lookup; the
 * signature is already the one it will keep, so no screen has to change.
 */
export function t(key: MessageKey): string {
  return pl[key];
}
