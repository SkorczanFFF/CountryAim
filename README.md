# CountryAim

Point your phone camera at a barcode and see which country issued it. The app freezes the frame
at the moment of the scan, shows the country, and gets out of the way with a single **Close**
button so you can keep scanning.

Mobile-first, fully client-side, no account, no backend.

---

## Read this first: what a barcode actually tells you

A GS1 prefix (the first three digits of an EAN-13) identifies the **GS1 member organisation
where the company registered its number range**. It is *not* the country of manufacture, and
treating it as such is wrong often enough to matter:

| Case | Prefix | Reality |
|---|---|---|
| A Polish company importing from China and packaging under its own brand | `590` | Made in China |
| A global group such as Nestlé | `76x` (Switzerland) | Manufactured in a dozen countries |
| A Czech producer that registered with GS1 Germany | `4xx` | Made in Czechia |
| A retailer's private label | retailer's prefix | Whoever won this quarter's tender |

So CountryAim deliberately does **not** say "Country of origin". It says *"Code issued by GS1
Poland"* plus a one-line note that this is the country of registration, not of production.

Where a real answer exists, the app fetches it: after showing the prefix result instantly and
offline, it queries [Open Food Facts](https://world.openfoodfacts.org) for the product name,
brand, and — when contributors have filled it in — the actual origin. The network never blocks
the primary answer.

---

## Status

Scaffold. Generated with `pnpm create vite --template react-ts`, then adapted to this project's
conventions. The toolchain, project references, the `~/` alias, the layered stylesheet, the test
setup and the production build all work. There is no routing or scanner yet.

The placeholder screen renders a **device capability probe**, which is deliberately useful: open
it on the phone you intend to test with and you will immediately see whether that device has
`getUserMedia`, a native `BarcodeDetector`, `requestVideoFrameCallback`, `light-dark()` and the
rest of what the app is built on — before thirty commits are stacked on those assumptions.

`public/favicon.svg` carries the app mark — barcode strokes inside a crosshair ring — replacing
the Vite logo that the scaffolder ships. The PWA icon set (192/512/maskable) is still to come.

See [`PLAN.md`](./PLAN.md) for the full design, the milestone breakdown and every technology
decision with its rationale and rejected alternatives.

---

## Quick start

Requires **Node `^20.19` or `>=22.12`** and **pnpm 11+**. `engineStrict` is on, so a wrong Node
version fails loudly instead of producing confusing errors.

> pnpm is not bundled with Node 25+ (corepack was unbundled), so install it separately:
> `npm i -g pnpm`, winget, or the standalone script.

```bash
pnpm install
pnpm dev
```

### Testing on a real phone

`getUserMedia` requires a secure context. `localhost` counts; your machine's LAN IP does not, so
`pnpm dev:host` alone is not enough — the camera will refuse to start over plain HTTP.

The least painful route is a tunnel with a real certificate:

```bash
pnpm dev
cloudflared tunnel --url http://localhost:5173
```

Open the printed `https://…trycloudflare.com` URL on the phone. `ngrok http 5173` works the same
way. A self-signed certificate on `pnpm dev:host` also works but forces you through a browser
warning on every device.

**In-app browsers block the camera.** Facebook, Instagram, LinkedIn and TikTok webviews will not
grant camera access. If you send yourself a test link through any of them, open it in Safari or
Chrome first.

---

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Vite dev server on `localhost:5173` |
| `pnpm dev:host` | Same, exposed on the LAN (still HTTP — see the tunnel note above) |
| `pnpm build` | `tsc -b` then `vite build` into `dist/` |
| `pnpm preview` | Serve the production build locally |
| `pnpm typecheck` | Full type check, no emit |
| `pnpm check` | Biome lint + format check (read-only) |
| `pnpm check:fix` | Biome lint + format, writing fixes |
| `pnpm ci` | Biome in CI mode — no writes, non-zero exit on any finding |
| `pnpm test` | Vitest, single run |
| `pnpm test:watch` | Vitest in watch mode |

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Build | Vite 8 | The app is 100% client-side; SSR would be pure overhead |
| UI | React 19 | — |
| Types | TypeScript 6.0.3 | The version the Vite template pins. TypeScript 7 (the native Go port) is `latest` and passes here, but the ecosystem has not moved yet |
| Styling | Native CSS, no framework | `light-dark()`, `@layer`, `@property`, `@starting-style`, container queries and `:has()` cover everything a framework would, and remove more dependencies than they add |
| Routing | wouter | Two routes; 2 KB instead of 16 KB |
| Lint + format | Biome | One Rust binary replacing ESLint, Prettier and six plugins. Replaces the scaffolder's oxlint, which formats nothing |
| Package manager | pnpm | Exact pinning, strict engine checks, fast installs |

Full reasoning, including what was rejected and why, is in [`PLAN.md`](./PLAN.md) §4.

### Browser support

The floor is **iOS/Safari 17.5+, Chrome 123+, Firefox 129+**, set by `light-dark()` and
`@starting-style`. Older browsers get a ~20-line token fallback; newer-still features
(View Transitions, `interpolate-size`) degrade silently to no animation rather than no
functionality.

---

## Conventions

- **Exact versions.** `saveExact: true` in `pnpm-workspace.yaml` — no `^`, no surprise minor
  bumps. Upgrades are deliberate commits. Note that pnpm 11 ignores `save-exact` in `.npmrc`;
  the setting only works from `pnpm-workspace.yaml`.
- **`~/` path alias** maps to `src/`, configured in both `vite.config.ts` and
  `tsconfig.app.json`. Prefer `~/lib/gtin` over `../../lib/gtin`.
- **`src/lib/` never imports React.** Domain logic stays pure and testable without a DOM.
  Enforced by a `noRestrictedImports` override in `biome.json`, not just documented here.
- **Conventional Commits**, one commit per functional unit, each leaving the repo in a working
  state. The milestone-by-milestone commit list is in `PLAN.md` §10.
- **[`CHANGELOG.md`](./CHANGELOG.md)** follows Keep a Changelog and is updated in the same commit
  as the change it describes.
- **Essential comments only.** Comments explain *why*, record a browser quirk, or warn about a
  trap. They never restate the code.
- **Formatting lives in `.editorconfig`**, which Biome reads via `formatter.useEditorconfig`.
  Indentation, line width and EOL have exactly one source of truth.

---

## Layout

What exists today:

```
src/
├─ lib/         pure domain logic, no React (enforced by a Biome override)
├─ hooks/       React bindings over lib/
├─ components/  UI, each with its own .module.css
├─ styles/      @layer order, reset, tokens, base
├─ App.tsx      composition root
└─ main.tsx     entry; imports layers.css first
```

Still to come, each created by the commit that first fills it — empty directories are not
placeheld, since the shape is documented here and in `PLAN.md` §5:

```
scanner/   camera lifecycle, decoder abstraction, scan loop, frame capture
api/       Open Food Facts client
routes/    "/" scanner, "*" 404
i18n/      PL/EN, country names via Intl.DisplayNames
theme/     light/dark/system switch
```

## Privacy

The camera feed and the captured photo never leave the device. The scanned EAN **is** sent to
Open Food Facts to look up product details; this will be stated on the start screen and made
switchable in settings.
