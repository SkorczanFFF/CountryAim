import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import browserslist from 'browserslist';
import { browserslistToTargets } from 'lightningcss';
import { defineConfig } from 'vitest/config';

const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as {
  version: string;
};

// Reads the browserslist field from package.json, so targets have one source of truth.
const targets = browserslistToTargets(browserslist());

/**
 * Serve over HTTPS when a certificate is sitting in certs/, and over plain HTTP
 * when there is none. getUserMedia refuses to run on a LAN address over HTTP, so
 * a phone cannot reach the scanner without one; making it conditional keeps the
 * repo working for anyone who has not generated a certificate. See the README
 * for the mkcert recipe, and for the two routes that need no certificate at all.
 */
const certificate = new URL('./certs/cert.pem', import.meta.url);
const privateKey = new URL('./certs/key.pem', import.meta.url);
const https =
  existsSync(certificate) && existsSync(privateKey)
    ? { cert: readFileSync(certificate), key: readFileSync(privateKey) }
    : undefined;

export default defineConfig({
  plugins: [react()],
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
  resolve: {
    // Anchored regex so package names that merely begin with "~" are left alone.
    alias: [
      {
        find: /^~\//,
        replacement: fileURLToPath(new URL('./src/', import.meta.url)),
      },
    ],
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: { targets },
  },
  server: { https },
  // The production build is worth testing on a phone too: the wasm decoder only
  // loads as a real chunk there.
  preview: { https },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/setupTests.ts'],
  },
});
