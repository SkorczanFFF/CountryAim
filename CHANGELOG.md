# Changelog

## 0.4.0 - 2026-08-30 — Two reads that agree

### Added

- `scanner/stabilise.ts`, the second of §7.3's two gates: a decode becomes a reading only once
  two in a row say the same thing, inside a one-second window. EAN-13 carries one check digit
  and no other redundancy, so a symbol read badly — a crease, a glare, a hand moving — can land
  on a number that passes mod 10 by luck. Two decodes landing on the *same* wrong number is a
  different order of unlikely.

### Changed

- Both gates are now required before the screen stops. The check digit stays at the call site
  rather than moving into the stabiliser, because a decode that fails mod 10 is not a reading
  and must not count towards a streak either.

### Notes

- Time is a parameter of `offer`, not something the module reads for itself. The rules are then
  testable without a clock: a streak at the edge of the window, a streak a millisecond past it,
  a misread landing between two good reads.
- Confirming ends the streak, so the decode arriving 80 ms later has to earn its own agreement
  instead of inheriting what was already spent. That is half of the cooldown §7.3 asks for.
  The other half is structural: the loop pauses the moment the frame freezes, so one view of
  one code cannot produce two results.
- N is two, where §7.3 says to start. Three is one argument away if misreads still get through
  on a real phone, and costs one more decode — about 80 ms at the loop's twelve attempts a
  second.
- 8 tests, 75 in total: seven on the rules, one that a single decode leaves the screen alone.

## 0.3.9 - 2026-08-30 — A registration, not an origin

### Added

- One sentence under the country's name: *To kraj rejestracji numeru, nie miejsce produkcji.*
  A GS1 prefix identifies the member organisation a company registered its range of numbers
  with. It is not where the thing was made — and a country's name under a barcode is read as
  "made there" unless something on the same screen says otherwise. This is that something. It
  is on screen from the moment the name is, and never behind a control: a disclosure that has
  to be opened is one most people never open.

### Notes

- Drawn only where a country is actually named. An ISBN, a coupon or a shop's own code carries
  no origin to be confused about, and correcting something nobody was about to think is noise.
  That is the condition the flag is drawn under too, which is not a coincidence — both follow
  from the reading naming a place.
- Placed under the name rather than at the foot of the panel, where §6's sketch has it. The
  misreading is made by that one word, so the correction has to arrive with it and not after
  the digits and the metadata. Prose size and sentence case for the same reason: the uppercase
  micro-type of the status row would file this as metadata, which is the one rank it cannot
  have.
- The mark beside it is Tabler's own `info-circle`, inlined rather than imported. The library
  arrives at commit 20 and §4.7 notes it needs `optimizeDeps` tuning to come at all, which one
  glyph does not justify pulling forward; it is drawn on the same 24 × 24 stroke grid, so
  dropping in `<IconInfoCircle stroke={2} />` later changes nothing on screen. A circle and not
  §4.7's alert triangle, which the plan keeps for alerts: this sentence is true of every
  correct reading, and a warning that never turns off is one people stop seeing. It hangs
  beside the text rather than flowing in it, so a second line lines up under the sentence and
  not under the glyph.
- The plan had this at commit 24, in M5. It moved here because the app started naming countries
  in 0.3.6 and has been saying more than it knows ever since. That stopped being a question of
  polish the moment an answer reached the screen.
- 2 tests, 67 in total: one that the sentence arrives with a country, one that it stays away
  from an ISBN.

## 0.3.8 - 2026-08-30 — Which build is this

### Changed

- The version now sits on the nameplate over the camera, beside the wordmark, and not only on
  the screen that comes up when the camera refuses to start. It was in exactly one place in
  `App.tsx`, inside the branch nobody sees when the app works.

### Notes

- The reason is the deploy. Work is tested on one branch address that gets overwritten in
  place, so the URL no longer says what is running behind it, and a phone holding the previous
  build in cache looks exactly like one that is not. The version has always been meant to
  answer "which build is this" during a phone test; until now it answered it on the wrong
  screen.
- Mono, without the wordmark's tracking, which would space four digits out into nonsense, and
  dimmed exactly like the hint rather than by a second number picked to taste. It falls behind
  the wordmark on size, and `text-transform: none` keeps it a lowercase `v` instead of
  inheriting the nameplate's capitals.
- 1 test, 65 in total. It pins the version to the camera view specifically, which is the half
  that was missing.

## 0.3.7 - 2026-08-30 — The frame stops

### Added

- A reading now stops the screen. The preview gives way to a still taken at the moment of the
  decode, the flag and the readout come up over it, and a „Zamknij" button underneath them
  puts the instrument back to work. The vertical slice closes here: camera, decode, answer,
  back to the camera.
- `scanner/freeze.ts`. The frame is drawn to a canvas and encoded as a JPEG at quality 0.85
  rather than left as a paused `<video>`, so what stays on screen is a picture of what was
  read and cannot drift with the camera.
- `result.close` in the copy module.

### Changed

- `sourceRect` takes the box to cut as a parameter instead of always cutting the scan band.
  The still and the decoder read the same `object-fit: cover` mapping this way. The
  alternative was a second copy of that arithmetic, and it would have been the copy that went
  wrong the day the preview's aspect ratio changed.
- `useScanLoop` takes a `paused` flag, read through a ref so pausing never tears the effect
  down. The stream keeps running and the detector stays loaded, so coming back from a frozen
  frame is immediate instead of a second of black while `getUserMedia` and a 1.07 MB wasm
  binary start over.
- `Readout` gains a required `onClose`. It is the only way out of a frozen frame, so the
  button takes the full width of the panel at the bottom of the screen, where a thumb
  already is.

### Notes

- Freezing is gated on the check digit, the first of the two gates in §7.3. One raw decode is
  not enough to stop the screen on — stopping it on a misread hands the user something to
  dismiss. The second gate, agreement between consecutive reads, is commit 13; until then a
  code whose checksum does not add up is simply read again.
- The still keeps 90% of the preview, against the 86% × 26% the reading was taken from. It
  is shown with `object-fit: cover` rather than `contain`, because the preview keeps playing
  underneath and any letterbox would show it moving behind a frozen picture. That crop runs
  over whatever the still kept, so a box cut further on one axis than the other has the
  difference encoded into the JPEG and then thrown away: the screen gets the smaller of the
  two fractions on both axes either way. Hence one number, with the band's own width as its
  floor — cut inside that and the picture loses the ends of the code it is proof of. A test
  pins it, because nothing on screen says which of the two crops did the cutting.
- Every still is a full-size JPEG held by an object URL, on a screen people use dozens of
  times in a row. `revokeObjectURL` runs on close, so a session does not collect a megabyte
  per scan.
- 8 tests added, 64 in total.

## 0.3.6 - 2026-08-24 — Flags above the band

### Added

- The flag of whatever issued the code, centred in the gap between the wordmark and the scan
  band. A range covering
  several countries shows all of them: 840-849 is Spain and Andorra, 800-839 is Italy, San
  Marino and the Vatican. This settles the question left open when the prefix table was
  written, which the data could not answer on its own.
- `country-flag-icons`, self-hosted. Flags are resolved at build time into a table of
  URLs, so the browser fetches only the one it needs and nothing goes to a third party.
- `i18n/reading.ts`: one place where a scan becomes something to put on screen. The flags
  and the readout now read from the same result instead of each working it out.

### Notes

- Measured before choosing: `flag-icons` ships 2.00 MB of flags against 178 kB here,
  because it draws the detailed coats of arms. Serbia is 181 kB there and 861 bytes here,
  Spain 80 kB against 599 bytes. At thirty pixels tall the detail is invisible, so the
  lighter set costs nothing to look at.
- Flags are forced out as files rather than inlined. Left to the default, all 259 would
  have become data URIs in the bundle, about a quarter of a megabyte to show one of them.
  The URL table alone adds 4.7 kB gzipped, which is the price of not knowing in advance
  which flag is needed.
- Ranges that are not countries — ISBN, coupons, in-store codes — show no flag. There is
  no symbol for them and inventing one would say something untrue.

## 0.3.5 - 2026-08-24 — A target behind the strokes

### Changed

- The favicon keeps its barcode strokes and swaps the plain ring behind them for a target:
  two broken arcs and a centre dot, with the arrow entering through the gap the arcs
  leave. That gap is what the break in the arcs is for. The app is called CountryAim, so
  the target and the arrow carry the name while the strokes carry the subject.

### Notes

- The arrow is drawn twice, once thick in the plate colour underneath, so it stays legible
  where it crosses the strokes. Without that it merges into them.
- Three overlapping systems is a lot for a browser tab. If it muddies at 16 pixels, the
  cheapest cuts are raising the opacity of the arcs or shortening the arrow so it stops
  before the strokes rather than crossing them.

## 0.3.4 - 2026-08-23 — Scanner layout

### Changed

- The interface is built as a measuring instrument. Near-monochrome cool greys, with red
  reserved for the one thing the tool is doing: reading.
- Spacing is derived from the barcode module, the narrowest bar in an EAN symbol, which
  puts the scale at 3, 6, 9, 15, 21 and 42 pixels instead of the usual round eights.
- The band is marked by four corner brackets in the mark's cyan, three pixels thick,
  sitting flush against the outside edge. They take no pixel of the area being read,
  and they breathe on the same 2.4 second cycle as the sweep, so the frame and the laser
  share one rhythm.
- The surround is darkened by a single spread shadow, which is what it was two passes ago
  and what worked. It is not blurred: doing that needs its own element, and the one that
  was there washed the image out.
- The capability probe shows state through bar length as well as colour, so it still reads
  when two similar reds cannot be told apart.

### Added

- The reading names its issuer. A country comes from `Intl.DisplayNames`, a shared member
  organisation is joined by `Intl.ListFormat`, and the ranges that are not countries at
  all — ISBN, ISSN, coupons, in-store codes, the GS1 Global Office pool — say what they
  are instead. This is the first time the domain layer finished in M1 reaches the screen.
- `components/Readout`: a blurred panel under a hairline, carrying the issuer beneath a
  short red rule, then the number with its GS1 prefix in laser red and underlined. Names
  stay in sentence case: caps read well on a short country and turn a long one into a
  wall. The prefix split follows the printed symbol rather than the canonical form: three
  digits for EAN-13 and EAN-8, two for UPC-A whose leading zero is implicit, none for
  UPC-E, which prints its digits compressed.
- The reading resolves in two beats, digits then answer, from weight 300 and wide tracking
  to weight 500 and tight, using the variable axes the fonts already ship.
- A status strip of hairline-separated readings: format, checksum and which decoder
  answered. The scan loop now surfaces its backend.
- The mark now sits beside the app name, on both the scanner and the status screen. It is
  the same `favicon.svg` rather than a copy, so the two cannot drift apart.
- A wordmark in the top corner and, while nothing has been read, a line under the band
- The app name is set in the mark'''s cyan beside it, on both screens. The status screen uses a
  themed variant of that colour, because the flat cyan sits at about 2:1 against a light
  background, which is not enough for a heading.
- `--aim`, `--chrome` and `--laser`, none of which flip with the theme, because the camera
  stage is video on black either way. `--aim` is written as a hex so it matches the mark
  in `favicon.svg` exactly.

### Notes

- There is no outline around the band. Two layers sharing one clipped shape cannot make
  an outline out of it — both fill the whole outside, and the upper one washes the image
  out. Brackets are the shape that works with a single fill.
- The readout blurs what is behind it. That is the first thing to drop if the scan rate
  suffers on a slow phone.
- Reduced motion needs no extra rule for the reading: the global override lands the
  resolve animation on its final frame, which is the legible one.

## 0.3.3 - 2026-08-23 — HTTPS for the dev server

### Added

- The dev server and `pnpm preview` serve over HTTPS when `certs/cert.pem` and
  `certs/key.pem` are present, and over plain HTTP when they are not. `getUserMedia`
  refuses to run on a LAN address over HTTP, so a phone cannot reach the scanner without
  a certificate, and making it conditional keeps the repo working for anyone who has not
  generated one. `certs/` is ignored by git so a private key cannot be pushed by
  accident.
- `preview` gets the same treatment deliberately: the production build is worth testing
  on a phone separately, because the wasm decoder only loads as a real chunk there.

### Changed

- The phone-testing section of the README lists three routes, cheapest first. Chrome port
  forwarding over USB makes an Android phone see the dev server as `localhost`, which is
  a trustworthy origin by definition and needs no certificate at all. A tunnel needs
  nothing installed on the phone and works on iOS. mkcert is for repeated LAN testing and
  costs one certificate authority installed on the device.

## 0.3.2 - 2026-08-23 — It reads barcodes

### Added

- `scanner/useScanLoop.ts`: decodes about twelve frames a second off the live preview.
  `requestVideoFrameCallback` where it exists and animation frames where it does not,
  since Firefox is inside our browser floor and has no rVFC. A decode in flight blocks
  the next attempt, so a slow WebAssembly frame cannot queue up behind itself.
- `scanner/roi.ts`: the band that is read, and the mapping from what the viewer sees back
  to camera pixels.
- `components/ScannerOverlay`: the band drawn on screen, dimmed outside, with a sweeping
  line. It takes its size from the same constant the crop uses, so the frame cannot drift
  away from the region actually being read.
- The scanned digits are shown raw for now. The frozen frame and the country follow next.

### Notes

- The crop is computed in displayed space, not source space. The preview uses
  `object-fit: cover`, so a 1280x720 camera in a 360x640 phone shows only 405 of the 1280
  source columns. Cropping 86% of the source would read 1101 columns — a barcode could be
  decoded well outside the frame the mask is drawing. A test pins the crop inside the
  visible region.
- The build confirms the split: the 1093 kB wasm binary and the 44 kB ponyfill are
  separate lazy chunks, so a device with a working platform decoder downloads neither.
- `@property` was scheduled to land here for the sweep animation and did not. A plain
  offset moves the line correctly, and reaching for an animated custom property would
  have been done only to justify a line in the README. If nothing genuinely needs it by
  the documentation commit, that line goes instead.
- Turning the camera off when the tab is hidden is still outstanding. Animation frames
  and rVFC both stop on their own, so no decoding happens, but the camera itself keeps
  running and draining. That belongs with the camera lifecycle, not the loop.

## 0.3.1 - 2026-08-23 — Decoder behind one interface

### Added

- `scanner/detector.ts`: the platform `BarcodeDetector` where it works, and the
  WebAssembly ponyfill everywhere else, behind one `detect`. The binary is imported
  dynamically, so Android Chrome never downloads it and Safari and Firefox only do once.
  The chosen backend is reported, because it is the first thing worth knowing when a
  device refuses to scan.
- `barcode-detector` and `zxing-wasm` as dependencies. `zxing-wasm` is direct rather than
  transitive because pnpm does not hoist, and it is pinned to exactly the version the
  ponyfill expects, which checks the binary against a known SHA-256.

### Notes

- The wasm binary is self-hosted. Left alone the library fetches it from
  `fastly.jsdelivr.net`, which would report every scan to a third party against what the
  README promises, leave the scanner dead offline, and break it during any CDN outage.
  `setZXingModuleOverrides` points it at a bundled asset instead.
- That binary is 1.07 MB, not the 300 KB the plan assumed. Corrected on record.
- A platform decoder is trusted only if it lists every format we need. Chrome ships the
  constructor on platforms where the format list comes back empty and nothing decodes,
  so presence alone proves nothing.
- Backends disagree on UPC-E: some return the eight compressed digits, others the twelve
  they expand to. Rather than pinning one backend by test, the adapter relabels twelve
  digits as the UPC-A they already are. Two implementations are allowed to differ, and
  hiding that is what an adapter is for; the parser stays strict.

## 0.3.0 - 2026-08-23 — The camera turns on

### Added

- `scanner/useCamera.ts`: opens the rear camera, hands back the stream, and stops every
  track on the way out. A stream that resolves after the effect was torn down is stopped
  immediately instead of being kept — without that branch StrictMode leaks the first
  stream on every mount in development and the camera light never goes off. It has its
  own test.
- `components/CameraView`: the full-screen preview. `playsInline` keeps iOS from taking
  the video fullscreen, `position: fixed; inset: 0` sidesteps every mobile
  viewport-height quirk at once, and `srcObject` is followed by an explicit `play()`
  because Safari ignores autoplay often enough to leave a black rectangle.
- Seven distinct failure reasons — insecure origin, unsupported browser, denied, no
  camera, camera busy, constraints unmet, unknown — decided in the hook rather than in
  the error screens that come later, so those screens will not have to change its
  return type. The reason is read off the error by shape rather than by `instanceof`,
  since `OverconstrainedError` is not a DOMException everywhere.
- `i18n/messages.ts` and `t()`. Polish only for now, but the signature is the one the
  locale provider will keep, so it replaces the lookup without touching a call site.
  Error copy is addressed as `camera.error.${reason}`, which makes the compiler reject a
  new failure reason that has no message.

### Changed

- The capability probe is no longer the main screen; it is what the error screen shows.
  When the camera will not start, the next question is always what the device actually
  has, so the probe is most useful exactly there.

### Notes

- `facingMode` is a preference, not `{ exact: "environment" }`. Exact throws on any
  device without a rear camera, which would make the app untestable on a laptop, and a
  phone picks the rear camera either way.
- No resolution is requested yet. The default may be too coarse to read a barcode at
  arm's length, but asking for more costs battery and heat, and there is nothing to tune
  against until the scan loop can measure a hit rate.

## 0.2.3 - 2026-08-23 — Localised country names

### Added

- `lib/countryName.ts`: country names straight from the platform CLDR data, and
  `Intl.ListFormat` to join the ranges that cover several countries — "Belgia
  i Luksemburg", "Italy, San Marino, and Vatican City". Neither costs a translated
  string, which is what keeps a new language at about ten interface strings rather than a
  hundred and thirty country names.
- `lib/locale.ts` holding `type Locale`, so the i18n provider and the country names will
  share one definition instead of each declaring their own.

### Notes

- The planned override for XK turned out to be unnecessary: CLDR carries Kosovo even
  though it is not an ISO 3166-1 code. Checked rather than assumed, and a test now holds
  that ground in case some browser disagrees.
- Names use `style: "long"`. `short` would improve "SRA Hongkong (Chiny)" to
  "Hongkong", but it also cuts "Wielka Brytania" to "Wlk. Bryt." and "Stany
  Zjednoczone" to "USA". The US and UK prefixes are common and Hong Kong is not, so the
  trade goes the wrong way. Worth revisiting once the result card exists to look at.
- A malformed region code throws a RangeError instead of falling back. That is documented
  rather than guarded: every code reaching the function comes from the prefix table, whose
  shape is already asserted by its own tests.

## 0.2.2 - 2026-08-23 — Prefix lookup

### Added

- `lib/lookup.ts`: resolves the digits a GTIN carries its GS1 prefix in to the range that
  issued them. An unassigned prefix comes back as `undefined`, which is a normal answer
  rather than an error: GS1 hands out new prefixes over time, and misread or non-standard
  codes reach here too. Tests run whole printed barcodes through `parseGtin` and into the
  lookup, covering every supported format, the multi-country case, two special ranges, and
  the boundaries around 590, 9790 and the GTIN-8 split.

### Notes

- The lookup scans linearly rather than by bisection. There are about 140 non-overlapping
  ranges and it runs once per successful scan rather than per frame, so a binary search
  would optimise nothing measurable while adding boundary cases to get wrong.
- It returns the matched range itself, bounds included, instead of a narrowed result type.
  Nothing is lost, no second union has to be kept in step with the first, and the bounds
  are useful when working out why a code resolved the way it did.

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
