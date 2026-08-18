# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Until `1.0.0`, minor
versions may contain breaking changes.

## [Unreleased]

### Added

- Project scaffold generated with `pnpm create vite --template react-ts`: Vite 8, React 19,
  TypeScript 6.0.3, split project references (`tsconfig.app.json` for `src/`,
  `tsconfig.node.json` for build config).
- `~/` path alias resolving to `src/`, wired in both `vite.config.ts` and `tsconfig.app.json`.
- Biome 2.5.9 as the single lint and format tool, reading indentation, line width and EOL from
  `.editorconfig` via `formatter.useEditorconfig`.
- pnpm as the package manager, with `saveExact` and `engineStrict` in `pnpm-workspace.yaml`.
- `__APP_VERSION__` build-time constant, sourced from `package.json`.
- Device capability probe as the placeholder screen: secure context, `getUserMedia`, native
  `BarcodeDetector`, `requestVideoFrameCallback`, WebAssembly, `light-dark()`, `@property`,
  `allow-discrete`, Popover API, View Transitions and the Vibration API. Lets a real test device
  be checked before any scanner code exists.
- `strict` and `noUncheckedIndexedAccess` in `tsconfig.app.json`; the scaffolder omits both, and
  the GS1 prefix table work depends on safe indexing.
- Application structure: `lib/` for React-free domain logic, `hooks/`, `components/` with
  co-located CSS modules, and `styles/`. Directories are created by the commit that first fills
  them; the intended shape is documented in the README and PLAN.md rather than mocked up with
  empty placeholders.
- A Biome override forbidding React imports under `src/lib`, with a message explaining why.
  The layering rule is now enforced by the linter instead of living only in documentation.
- Cascade layers in `styles/layers.css`, declared before any rule and imported first in
  `main.tsx`. The `prefers-reduced-motion` block lives in the last layer, which lets it beat every
  component animation without a single `!important`.
- Design tokens in `styles/tokens.css`: `light-dark()` pairs in `oklch()`, so each colour is
  defined once instead of three times, plus the cyan accent, spacing and radius scales. A
  `@supports not (color: light-dark(...))` block covers pre-2024 browsers.
- Capability probe split into `lib/capabilities.ts` (pure, no React), `hooks/useCapabilities.ts`
  and a `CapabilityReport` component with its own CSS module.
- Vitest with happy-dom, Testing Library and jest-dom matchers, wired through `src/setupTests.ts`.
  `pnpm test` runs five tests covering the probe and the rendered app.
- `PLAN.md` with the full design, technology decisions, commit plan and the complete GS1 prefix
  table.
- `README.md` covering setup, phone testing over HTTPS, conventions and the GS1 prefix caveat.

### Changed

- Replaced the scaffolder's `oxlint` with Biome. oxlint only lints; Biome also formats, so it
  removes the need for a separate formatter.
- Replaced `public/favicon.svg` with the app's own mark: barcode strokes inside a crosshair ring.
  The scaffolder ships the Vite logo, which would otherwise have shipped as this app's identity.
  Six bars on a 32-unit viewBox, widths 2-4-2-2-4-2 with a uniform 5-unit pitch, spanning
  2.5–29.5 and 18 units tall, so the block is centred on both axes and mirror-symmetric about the
  vertical axis. Bars pass over the ring rather than being contained by it, which is what allows
  them to be this large; the ring sits behind at 0.55 opacity and shows through all five gaps and
  at the top and bottom centre, reading as a reticle interrupted by the barcode. Varying widths
  with a constant pitch give a barcode silhouette while keeping the rhythm even — the wider centre
  gap echoes an EAN centre guard. Rounded bar corners clear the plate's own corner radius by
  ~2 units.

### Removed

- Scaffolder demo page and its assets: `src/App.css`, `src/index.css`, `src/assets/*` and
  `public/icons.svg`, replaced by this project's own layered stylesheet and components.
  `src/assets/hero.png` would otherwise have sat in git history permanently for no reason.

### Notes

- pnpm 11 no longer reads `save-exact` / `engine-strict` from `.npmrc` and ignores them without
  warning; those settings live in `pnpm-workspace.yaml` as `saveExact` / `engineStrict`.
- Node 25+ no longer bundles corepack, so pnpm must be installed separately.
- TypeScript stays on 6.0.3, the version the Vite template pins. 7.0.2 is `latest` and type-checks
  this project cleanly, but the ecosystem has not moved to the native compiler yet.
- Biome parses `light-dark()`, `@layer`, `@supports not (...)` and native nesting without
  complaint, so its CSS linter stays on. It also flagged the `!important` in the reduced-motion
  block, which the layer architecture made unnecessary.
- Biome's `files.includes` excludes `public`, because `lint/a11y/noSvgWithoutTitle` fires on the
  standalone favicon — a rule meant for inline SVG in components.
- Deployment target is Vercel. Three things to verify on the first deploy: that the build image
  supports pnpm 11 via the `packageManager` field, that `pnpm-workspace.yaml` in a single-package
  repo is not treated as a monorepo root, and that the Node version satisfies `engines` given
  `engineStrict` is on. The SPA fallback `vercel.json` lands with routing, not before.

[Unreleased]: https://github.com/
