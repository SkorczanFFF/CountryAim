# Changelog

## 0.2.1 - 2026-08-23 — GS1 prefix table, and a plan reordered around it

### Added

- `lib/gs1Prefixes.ts`: the GS1 prefix ranges, as a discriminated union of `country`,
  `region` and `special` entries. `region` exists because six ranges cover more than one
  country — France and Monaco, Belgium and Luxembourg, Denmark with the Faroes and
  Greenland, Switzerland and Liechtenstein, Italy with San Marino and the Vatican, Spain
  and Andorra — so no single flag or name fits them. Anything the table does not cover is
  unassigned by omission, rather than through a hand-maintained list of gaps.
- Six structural tests over that table: sorted, non-overlapping, in-range bounds, ISO codes
  well formed, regions holding more than one country. A hand-transcribed table has no other
  guard, because a wrong code is internally consistent and simply shows the wrong country.

### Changed

- The commit plan now reaches a working app at commit 12 instead of commit 24. The camera
  sat at commit 15, behind the whole UI shell, which put the least certain part of the
  project last; risk is retired in order of risk, not in order of layers. After the domain
  logic the next four commits are camera, detector, scan loop and result — a vertical slice
  — and routing, theme, i18n, settings and Open Food Facts are then built on something that
  works. The cost is that those screens predate i18n, so their copy lands in one keyed
  module from the first commit and the provider later consumes it instead of rewriting them.
- Milestones renamed to match: 0.3.x is the working slice, 0.4.x hardens the scanner, 0.5.x
  is the shell, 0.6.x polishes the result. 1.0.0 becomes the single deliberate exception to
  the automatic bump, declared once the whole loop has been tested on a real phone.

### Fixed

- The test barcode `2012345678909` carries an invalid check digit; it is `2012345678903`.
  `parseGtin` would have rejected it before any prefix lookup, so the case never tested the
  restricted-distribution range it was there for. Test codes for EAN-8 and UPC-E were
  missing entirely despite both being supported, and both traps live there.
- Nine documentation inconsistencies, none of which would have failed a test: the accent
  colour on record did not match the one in `tokens.css`; the prefix-table sketch predated
  the `region` kind and still listed `unassigned` as a special key; the dev dependency
  table named `@vitejs/plugin-basic-ssl`, contradicting the tunnel approach documented in
  the README, and omitted the test tooling actually installed; the i18n section still
  claimed Belgium and Luxembourg need manual handling, which `Intl.ListFormat` removed; the
  favicon was recorded as 24 units tall against an actual 18; and the architecture tree
  omitted `hooks/` while claiming `tokens.css` contains `@property`.
- `@property` is declared in the README and probed by the capability report but used
  nowhere. It now lands with the scan loop, animating the scan indicator, which is the
  place it was always meant for.

### Notes

- Ranges are stored in a four-digit space rather than three, because GS1 publishes
  allocations finer than three digits: the GTIN-8 pool splits 962 between GS1 UK
  (9600-9624), GS1 Poland (9625-9626) and the Global Office (9627-9699), and 9790 carves
  ISMN out of the middle of the ISBN range. Three digits would have mis-attributed both
  silently.
- Checked against Wikipedia rather than gs1.org, which answers 403 to automated requests.
  The pass found fifteen corrections, four of which would have named the wrong country:
  Kosovo is 381 and not 390, 605 is Uganda and not Tunisia, 606 is Angola and not Uganda,
  and 623 reads as reserved rather than Brunei. 623 is the one entry worth confirming by
  hand against the official list.

## 0.2.0 - 2026-08-23 — GS1 domain logic begins

### Added

- `lib/gtin.ts`: GTIN parsing with GS1 mod-10 check digit validation, covering EAN-13, EAN-8,
  UPC-A and UPC-E. `parseGtin` takes the format from the detector instead of guessing it from
  the length, because EAN-8 and UPC-E are both eight digits and need opposite handling: a UPC-E
  has to be expanded to twelve digits before its check digit means anything, while an EAN-8 must
  not be expanded at all. Tests pin both directions of that confusion. It returns two forms of
  the number, `gtin14` for identity and `prefixSource` for the GS1 lookup, because padding an
  EAN-8 out to fourteen digits would make its prefix read as 000, the United States, rather than
  the organisation that issued it.

## 0.1.2 - 2026-08-22 — Local fonts

### Added

- Space Grotesk for text and Kode Mono for digits, self-hosted through Fontsource variable
  packages and wired to `--font-sans` and `--font-mono`. Each family ships a single `wght.css`
  covering every subset, so one import per family is enough and `unicode-range` decides what a
  browser actually downloads. Polish diacritics live in `latin-ext` rather than `latin`, so a
  Polish interface pulls two files per family instead of one. The weight axes are 300-700 for
  Space Grotesk and 400-700 for Kode Mono, so a lighter monospace weight does not exist. Space
  Grotesk also ships a Vietnamese subset no client will ever request; the package exposes no
  per-subset entry point, so it stays on the CDN unused.

### Notes

- The families register as `Space Grotesk Variable` and `Kode Mono Variable`. Without the suffix
  the browser silently falls back to the next entry in the stack, which looks almost right.
- By this point the app had been deployed, which settled the three Vercel questions recorded in
  `0.1.0`: the build image handles pnpm 11 from the `packageManager` field, `pnpm-workspace.yaml`
  is not treated as a monorepo root, and the default Node satisfies `engines` under
  `engineStrict`.

## 0.1.1 - 2026-08-22 — CSS build targets

### Added

- Lightning CSS as the CSS transformer, with targets read from a new `browserslist` field in
  `package.json` so they have one source of truth. `build.cssMinify` is deliberately not set:
  Vite already minifies with Lightning CSS when it is the transformer.

### Changed

- Lowered the browser floor from Safari 17.5 to **Safari/iOS 16.4** (Chrome 111, Firefox 113).
  Measurements showed Lightning CSS compiles both native nesting and `light-dark()` down to that
  target, so older Safari costs nothing in the stylesheets, while the scanner itself only needs
  Safari 15.4. Holding the floor at 17.5 would have excluded users purely over CSS cosmetics.
  Everything that degrades below the floor is animation: `@starting-style`, View Transitions and
  `interpolate-size`.
- The settings panel will use `<dialog>` with `showModal()` instead of the Popover API, which
  requires Safari 17 and is therefore above the new floor. `<dialog>` gives the same top layer,
  focus trap, Esc handling and `::backdrop`; only light-dismiss has to be added by hand.
- The capability probe follows from both changes above: `light-dark()` is no longer marked
  required, because a device without it renders correctly and requiring it would have shown a
  blocking "the scanner will not work" alert on a working device. Its Popover row is replaced by
  a `<dialog>` / `showModal()` row, since nothing in the app uses `popover` any more.
- `README.md` and this file no longer link to the local design notes, which stay out of the
  repository, so no published document points at a file GitHub cannot serve.

### Removed

- The hand-written `@supports not (color: light-dark(...))` fallback in `styles/tokens.css`.
  Lightning CSS generates an equivalent automatically, using a custom-property toggle, and it
  detects the `[data-theme]` selectors on its own so the manual theme switch keeps working on old
  browsers. The generated version cannot drift out of sync the way a duplicated token block can.
  Built CSS dropped from 3758 to 3352 bytes.

### Notes

- Lightning CSS was **already in the build** before this version: Vite 8 minifies with it by
  default, using targets derived from `build.target`. The deployed `0.1.0` stylesheet already
  contained the generated theme toggle, which means the hand-written `@supports` block had been
  duplicating it in production from the start. What this version actually changed is taking the
  targets under explicit control, enabling Lightning CSS as the transformer as well, and deleting
  the duplication.
- Vite runs CSS through Lightning CSS twice (transform, then minify), so the theme toggle
  declarations appear duplicated in the output. They are idempotent and about 60 bytes before
  compression. `cssMinify: 'esbuild'` would avoid it, but Vite 8 builds on Rolldown and no longer
  ships esbuild, so that would mean adding a dependency to save 60 bytes.

## 0.1.0 - 2026-08-18 — Scaffold and toolchain

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
  `allow-discrete`, the Popover API, View Transitions and the Vibration API. Lets a real test
  device be checked before any scanner code exists.
- `strict` and `noUncheckedIndexedAccess` in `tsconfig.app.json`; the scaffolder omits both, and
  the GS1 prefix table work depends on safe indexing.
- Application structure: `lib/` for React-free domain logic, `hooks/`, `components/` with
  co-located CSS modules, and `styles/`. Directories are created by the commit that first fills
  them; the intended shape is documented rather than mocked up with empty placeholders.
- A Biome override forbidding React imports under `src/lib`, with a message explaining why. The
  layering rule is enforced by the linter instead of living only in documentation.
- Cascade layers in `styles/layers.css`, declared before any rule and imported first in
  `main.tsx`. The `prefers-reduced-motion` block lives in the last layer, which lets it beat every
  component animation without a single `!important`.
- Design tokens in `styles/tokens.css`: `light-dark()` pairs in `oklch()`, so each colour is
  defined once instead of three times, plus the cyan accent, spacing and radius scales, and a
  hand-written `@supports not (color: light-dark(...))` fallback for older browsers.
- Capability probe split into `lib/capabilities.ts` (pure, no React), `hooks/useCapabilities.ts`
  and a `CapabilityReport` component with its own CSS module.
- Vitest with happy-dom, Testing Library and jest-dom matchers, wired through `src/setupTests.ts`.
  `pnpm test` runs five tests covering the probe and the rendered app.
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
