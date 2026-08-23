/**
 * Every flag as a URL, resolved at build time. Files are emitted as assets and
 * self-hosted, so the browser fetches only the one it needs and nothing is
 * requested from someone else's CDN.
 */
const MODULES = import.meta.glob('/node_modules/country-flag-icons/3x2/*.svg', {
  query: '?url',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const FLAG_URLS: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(MODULES).map(([path, url]) => [
    path.slice(path.lastIndexOf('/') + 1, -'.svg'.length),
    url,
  ]),
);

export function flagUrl(iso: string): string | undefined {
  return FLAG_URLS[iso.toUpperCase()];
}
