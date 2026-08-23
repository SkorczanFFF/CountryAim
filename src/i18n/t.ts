import { type MessageKey, pl } from './messages';

/**
 * Polish only for now. M4 swaps the body for a locale-aware lookup; the
 * signature is already the one it will keep, so no screen has to change.
 */
export function t(key: MessageKey): string {
  return pl[key];
}
