# Garden's Almanac — editorial design rules

The design language of *Garden's Almanac of Matter Models* (thegardens.ai): a
long-form, almanac-styled publication. Paper-and-ink, typeset like a
well-printed reference book, not a dashboard.

## Hard rules

- **No shadows, no border-radius, no gradients.** Surfaces are flat paper;
  structure comes from hairline rules (`0.5px solid var(--rule)`), not
  elevation.
- **Don't invent new colors.** Use the tokens in `styles.css` (`--paper`,
  `--paper-2`, `--ink`, `--ink-2`, `--ink-3`, `--oxblood`, `--rule`,
  `--rule-soft`). They were tuned for the cream-paper feel.
- **Oxblood (`--oxblood`) is reserved** for links and verified/lapsed status
  marks only — never decoration, never headings, never fills.
- **Tabular numerals on every numeric column**: `font-variant-numeric:
  tabular-nums` (already on `table.almanac`).
- **Type sizes come from the `--fs-*` scale** (`--fs-micro` 10.5px …
  `--fs-display` 52px). Never ad-hoc px values.
- **Status glyphs are Unicode text**, not icons: `●` verified, `○` installed
  but not recently verified, `—` not installed. Color them with
  `.status-verified` / `.status-stale` / `.status-na`.

## The three typefaces — one job each

- **Source Serif 4** (`--serif`) — reading and identity: headings, body copy,
  primary names in tables.
- **IM Fell English SC** (`--smallcaps`, via the `.sc` class) — labels and
  navigation only: column headers, eyebrows, wordmarks, legends. Set label
  text in **true lowercase** so it renders as uniform small caps.
- **JetBrains Mono** (`--mono`, via the `.mono` class) — data only: IDs,
  code, GPU types, version pins.

Keep the faces in their lanes or the page reads as noise. Small-caps letter
spacing comes from two tokens only: `--track-label` (0.08em, tables/labels)
and `--track-display` (0.14em, masthead nav + eyebrows).

## Links

- Prose links: `a.ink-link` — persistent oxblood with a 0.5px underline.
- Dense tables: hover-reveal links (`.clk` with `.clk-ink`/`.clk-ink2`/
  `.clk-ink3` resting colors) so tables stay calm at rest — no resting link
  indicator inside a data table.

## Page anatomy

Every page is one centered `article.page` canvas (max-width 1200px, cream
`--paper`) on a darker `--paper-edge` body. Chrome: `.site-head` (wordmark +
small-caps nav over a single hairline), `.site-foot` (hairline above).
Section breaks use `.hairline`, `.title-rule` (double rule under page
titles), `.double-rule`, or the `.ornament` glyph-between-rules divider.
Detail layouts use `.detail-body` (content + 220px `.detail-rail`
marginalia; `.margin` blocks with a small-caps `.label`).
