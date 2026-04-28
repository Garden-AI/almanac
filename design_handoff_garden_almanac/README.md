# Handoff: Garden's Almanac of Matter Models, 2026 Edition

## Overview

The Garden's Almanac is a long-form web publication for **thegardens.ai** — a working reference catalog of machine-learning interatomic potentials (MLIPs), the datasets they're trained on, the clusters they run on, and the architectural families they belong to. It is structured and styled as a **printed almanac**: a single continuous reading experience laid out as a sequence of fixed-format 880×1120 pages, threaded through a folio/running-head system, with marginalia, ornaments, and a deliberately non-web typography. Most pages are text-and-table dense; key pages (the Map, the Compatibility Matrix) are diagrammatic.

This is the v1 design. It includes:

- **Frontispiece** (cover) and **About** spread
- **§02 The Map** — facing-page spread with a 2D embedding of all models
- **§04 Clusters** — Della cluster as the worked example, facing-page spread
- **§05 Datasets** — index of 12 datasets + OMat24 detail page (template for the rest)
- **§06 Architectures** — facing-page glossary covering 5 model families
- **Compatibility Matrix** — large model × cluster grid
- **Model detail page** template
- A **Design Canvas** that presents all artboards together for review

## About the Design Files

The files in this bundle are **design references created in HTML** — high-fidelity prototypes showing intended look, layout, and behavior, not production code to ship directly. They use React 18 via inline Babel transpilation (a fast iteration setup, not a deployable architecture) and load Google Fonts directly.

The task is to **recreate these designs in the target codebase's existing environment** — Next.js, Astro, Eleventy, Hugo, Vue, plain HTML/CSS, whatever the production app uses — using its established patterns, asset pipeline, and content-source-of-truth (MDX, CMS, JSON files, etc.). If no environment is established yet, **Astro** is a strong choice for this kind of long-form, mostly-static, content-dense publication: per-page React islands for the few interactive bits, MDX for editorial pages, and great control over typography and CSS.

The structured records in `datasets.jsx`, `architectures.jsx`, and `cultivation.jsx` (`DATASET_RECORDS`, `MODEL_TRAINING_DATA`, `FAMILIES`, `MODEL_META`, `CLUSTER_RECORDS`) should be ported to whatever data layer the target uses (TypeScript modules, a CMS, MDX frontmatter). The cross-references in the Almanac — datasets ↔ models ↔ architectures ↔ clusters — are the most valuable part of the data model and should be preserved as **structured links**, not free-text references.

## Fidelity

**High-fidelity.** Every page is pixel-targeted at 880×1120, with exact typography, hairline rules, ornament weights, table styling, and spacing. All page heights have been verified to fit within the artboard. The designs commit to a specific look — restrained, typographic, almanac-flavored — and that aesthetic is intentional. **Recreate the UI pixel-perfectly.**

That said, two adjustments are explicitly expected when porting:

1. **Page format**: The 880×1120 fixed pages are an artifact of the design canvas. In production, this should become a **responsive long-scroll reading experience** with print-stylesheet support that produces those same page boundaries when printed to PDF. The folio + running-head + marginalia system already maps cleanly to print. See *Responsive Behavior* below.
2. **Routing**: All `<a href>` values in the prototypes are hardcoded (`/dataset/omat24`, `/model/uma-medium`, etc.). Wire these to the target framework's router and add real linked pages over time.

## Pages / Views

Each page is a single `.page` element sized 880 × 1120 with 64px horizontal and 56px vertical padding, a folio at the bottom, and a running-head at the top. The shared chrome is defined once; per-page content varies.

### 0. Page chrome (shared)

Used on every page.

- **Page container** `.page` — 880×1120, paper background `#f4ede0`, padding 56px 64px, `display: flex; flex-direction: column`.
- **Running head** — top of page, `border-bottom: 0.5px solid var(--rule)`, paddingBottom 4px. Two spans (left = book title or section name, right = section name or page identifier), `font-family: var(--smallcaps)`, 10px, letter-spacing 0.10em, color `var(--ink-2)`.
- **Folio** (page footer) — bottom of page, `border-top: 0.5px solid var(--rule)`, paddingTop 6px. Three spans (left = page id, center = numeric ornament `·`, right = "Garden's Almanac, 2026"), `font-family: var(--smallcaps)`, 10px, letter-spacing 0.10em.
- **Hairline rule** `hr.hairline` — 0.5px solid `var(--rule)`, no margin override per-use.
- **Ornament rule** `<Ornament.Rule width={N}/>` — a centered horizontal rule with a small diamond glyph, used after title blocks. Width is configurable.

### 1. Frontispiece (`frontispiece.jsx`)

The cover page. Title in large Source Serif 4 (≥72px), subtitle in italic, edition line in small caps. Centered vertically with generous whitespace; a single ornament below the title.

### 2. About spread (`about.jsx`)

Two facing pages of editorial copy describing the Almanac's scope, conventions, and disclaimers. Body text is `.body-prose` (Source Serif 4 14.5px, line-height 1.5). First paragraph on each page uses a drop-cap (≈42px serif initial, float-left, 2 lines).

### 3. §02 The Map — facing-page spread (`atlas.jsx`)

A 2D embedding of all catalog models (UMAP-style). The chart is a custom SVG.

- **Left page**: title block, prose introducing the Map, a small **legend** keyed to the 5 architecture families (Equivariant, ACE, Message-Passing, Vanilla, Earlier Generations), and a **reading guide** marginalia note.
- **Right page**: the full 2D embedding, ~700×900 SVG with axis hairlines, model points (size by params, color by family), and cluster annotations (Della, Tiger, Adroit) shown as soft circles with small-caps labels.
- Each point links to `/model/<slug>`.

Family colors:
- Equivariant — `var(--ink)` `#1a1612`
- ACE — `var(--oxblood)` `#7a2222`
- Message-Passing — `var(--moss)` `#3f5c3a`
- Vanilla — `var(--ochre)` `#a17a2a`
- Earlier — `var(--ink-3)` `#6b5e4f`

### 4. §04 Cluster — Della (facing-page spread, `cultivation.jsx`)

`CLUSTER_RECORDS` is a record of HPC clusters keyed by slug; Della (Princeton) is the worked example. The other slugs reuse the same template.

- **Left page** (`ClusterPage`): cluster name as h1 (42px Source Serif), institution in small caps, italic subtitle, ornament rule. Two-column body: **Specifications** table (key/value rows for partition, GPUs, CPUs, interconnect, scheduler, etc.) and a **Running on Della** prose section. Right rail (220px) holds **Notes** (italic, 11.5px) and **References** (numbered list with hairline above).
- **Right page** (`ClusterSupportedPage`): full **Supported Models** table sorted verified → stale → N/A, then by params descending. Columns: Model (italic link), Family (small caps), Params (tabular-nums right), Status (glyph: ● verified, ◐ stale, ○ N/A), Install command (mono).

### 5. §05 Datasets

`DATASET_RECORDS` covers 12 datasets across molecules, materials, catalysis, and mixed domains.

- **Index page** (`DatasetsIndexPage`): title block, 2-paragraph editorial preface, a **chronological table** (oldest first — QM9 2014 → OMol25 2025) with columns Name, Domain, Size, DFT level, Year. Right rail has a cross-references note.
- **Detail page** (`DatasetDetailPage`, OMat24 worked example): title block with domain small-cap eyebrow + full dataset name + curator/year subtitle. Three sections in the main column:
  1. **Constitution** — 9-row key/value table (Full name, Curator, Size, Composition coverage, DFT level of theory, Released, License, DOI as link, Primary paper).
  2. **How to Get It** — 1–2 prose paragraphs with inline backtick-styled code, plus a 3-line monospace command block (`.cmd` style: warm-paper background, hairline border, mono font 10.75–11px, padding 8px 10px).
  3. **Models Trained on \<dataset>** — table computed from `MODEL_TRAINING_DATA`, columns Model (italic link), Family (small caps), Used as (italic role: Pretraining / Fine-tuning / Sole training data / Joint training / Auxiliary).

  Right rail has italic **Notes** (~95 words) and a 4-item **References** list (numbered links).

  All other dataset slugs render from the same template; only `DATASET_EDITORIAL[slug]` (notes, how-to-get prose, references) is dataset-specific.

### 6. §06 Architectures (facing-page spread, `architectures.jsx`)

A working-vocabulary glossary of the 5 model families.

- **Left page** (`<ArchitecturesPage side="left"/>`): title "Architectures" with §06 small-caps and a **lattice cartouche** (a 64×64 SVG of a hexagonal graph motif: 6 ring nodes + 1 oxblood center, with edges to center and around the ring; double concentric circle outline). Single-paragraph editorial preface, then 3 capsules: **Equivariant**, **ACE**, **Message-Passing**.
- **Right page** (`side="right"`): smaller title block "Architectures · continued" (32px h1 instead of 42px), 2 capsules: **Vanilla**, **Earlier Generations**, plus an **On cross-linking** note that links to all 5 family anchors.

Each `FamilyCapsule`:
- h2 (Source Serif 21px, 600), italic descriptor (12.5px, ink-2), then a 2-column body: prose left (11.75px / 1.4, max 560px), and a small **Models in this family** table right (260px wide; columns: Model italic link, Year right-aligned ink-2, Params right-aligned tabular-nums). The capsule table uses a tighter `.fam-table` row padding (2.5px 8px) than the default `.almanac` table (5px 8px) — this is critical to fitting the 9-row Message-Passing capsule.
- Capsules are separated by a hairline divider.

### 7. Compatibility Matrix (`compatibility.jsx`)

A large model × cluster grid showing verified / stale / N/A status. Columns: clusters (Della, Tiger, Adroit, Stellar, Frontera, Anvil, Bridges-2, …). Rows: models, sorted by family then year. Cells render the same status glyphs as the Cluster page (●/◐/○). Sticky first column for the model name; right edge has a "Last verified" column with a relative date.

### 8. Model detail page (`model-page.jsx`)

Template page for individual models. Title block (model name h1, family small-caps eyebrow, italic subtitle with year + lead author), Specifications table, Training data table (links to `/dataset/<slug>`), Running on table (cluster status), prose sections, marginalia rail with citations.

## Interactions & Behavior

The Almanac is **mostly static reading**. The prototypes use anchor links and standard browser navigation; there is no client-side state machine.

- **Internal links**: every dataset/model/cluster name in a table renders as `<a class="ink-link" href="...">name</a>`, italicized. Hover state: underline appears (currently inherited from `.ink-link` style — confirm it matches the spec when porting).
- **Anchors on the Architectures page**: `/architectures#equivariant`, `#ace`, `#mpnn`, `#vanilla`, `#earlier`. Cross-page anchors should scroll smoothly.
- **The Map**: model points are anchors to `/model/<slug>`. Hovering should reveal a small label tooltip (the prototype shows persistent labels for cluster centers; per-point tooltips on hover are a recommended enhancement).
- **Compatibility matrix**: cells are visual only in v1. A cell could link to the model + cluster page in v2.
- **Tweaks panel**: not used in this build.

There are no animations, no loading states, no form inputs.

## Responsive Behavior

The prototypes are fixed at 880×1120. In production:

- **Below ~720px wide**: collapse the marginalia rail underneath the main content (single column). Reduce h1 from 42px to 32px and proportionally scale capsule h2s. Tables remain horizontally scrollable on narrow viewports — do not break tables into stacked cards.
- **720–960px**: keep the two-column body but narrow the rail to ~180px.
- **≥960px**: render at the design width (880px content + breathing room) centered on the page; the surrounding viewport is the "endpaper" — same `--paper` color, no chrome.
- **Print**: `@page { size: 880px 1120px; margin: 0 }` and `.page { page-break-after: always }`. The folio and running-head are designed to read as printed page furniture; they should render in print as-is.

## State Management

None on the frontend beyond client-side routing. The data model lives in static records:

- `MODEL_META` (`architectures.jsx`) — keyed by display name; year, params, family, slug.
- `FAMILIES` (`architectures.jsx`) — ordered list of 5 families with name, descriptor, body prose, model list.
- `DATASET_RECORDS` (`datasets.jsx`) — keyed by slug; full metadata.
- `DATASET_EDITORIAL` (`datasets.jsx`) — keyed by slug; per-dataset notes/howToGet/references. Datasets without an entry fall back to OMat24.
- `MODEL_TRAINING_DATA` (`datasets.jsx`) — array of `{model, slug, family, uses: [{ds, role}]}`. Drives the **Models Trained on \<dataset>** reverse-index table.
- `CLUSTER_RECORDS` (`cultivation.jsx`) — keyed by slug; specs, supported models, running-on prose, notes, references.
- `STATUS_ORDER` (`cultivation.jsx`) — sort priority for verified/stale/N/A.

When porting, **flatten these into TypeScript modules or content collections** with explicit types. The cross-references between models, datasets, clusters, and families should be checked at build time (e.g. fail the build if `MODEL_TRAINING_DATA[i].uses[j].ds` doesn't exist in `DATASET_RECORDS`).

## Design Tokens

Defined in `almanac.css` as CSS custom properties on `:root`. Do not invent new colors — these were tuned to match the almanac feel.

### Colors

| Token | Value | Use |
|---|---|---|
| `--paper` | `#f4ede0` | Page background (warm cream) |
| `--paper-2` | `#ebe2cf` | Subtle alternate fill (hairline boxes, table zebra not used) |
| `--ink` | `#1a1612` | Body text, titles, primary borders |
| `--ink-2` | `#5a5147` | Secondary text (subtitles, ink-2 spans) |
| `--ink-3` | `#857a6a` | Tertiary text (folio, "Earlier" family) |
| `--rule` | `rgba(26,22,18,0.35)` | Standard hairline borders |
| `--rule-soft` | `rgba(26,22,18,0.18)` | Internal table cell borders, marginalia left rules |
| `--oxblood` | `#7a2222` | Accent: ACE family color, cartouche center, status glyph emphasis |
| `--moss` | `#3f5c3a` | Accent: Message-Passing family color |
| `--ochre` | `#a17a2a` | Accent: Vanilla family color |

### Typography

| Token | Stack | Use |
|---|---|---|
| `--serif` | `'Source Serif 4', Georgia, serif` | All body text and titles |
| `--smallcaps` | `'IM Fell English SC', 'Source Serif 4', serif` | Section eyebrows, running heads, folios, table headers, "Models in this family" labels |
| `--mono` | `'JetBrains Mono', monospace` | Install commands, inline backtick code |

Type scale (used consistently):

- Page h1: 42px / 1.0 / 600 / -0.005em
- Sub-page h1: 32px / 1.05 / 600
- Section h2: 21–22px / 1.05 / 600
- Subtitle (italic): 13–14px / 1.4 / `var(--ink-2)`
- Body prose: 12.25–12.75px / 1.45–1.5 / `var(--ink)`
- Capsule prose: 11.75px / 1.4
- Table body: 11.5–12.5px (tabular-nums on numeric columns)
- Table header (small-caps): 11–11.5px / letter-spacing 0.06–0.10em
- Eyebrow small-caps: 11.5px / letter-spacing 0.14em
- Folio / running head: 10–11px / letter-spacing 0.10em

### Spacing

The grid is loose-pixel rather than a fixed scale. Common values: 4, 6, 8, 10, 12, 14, 22 (column gap), 56 (page padding y), 64 (page padding x), 220 (rail width), 260 (in-capsule table width).

### Borders & rules

- `0.5px solid var(--rule)` — hairlines, the default page divider weight
- `1.5px solid var(--ink)` — emphasis rule under section headings, top of `<thead>`, last `<tr>` of a table body
- `0.5px solid var(--rule-soft)` — internal table cell separators (right border)
- No border-radius anywhere — the almanac aesthetic is **all squares, all hairlines**.

### Shadows & gradients

**None.** Do not introduce drop shadows, soft fills, or gradient backgrounds. The Almanac is paper.

### Status glyphs (`StatusGlyph`)

- `verified` → `●` (filled disc, `var(--ink)`)
- `stale` → `◐` (half-filled, `var(--ink-2)`)
- `n/a` → `○` (open circle, `var(--ink-3)`)

Used in cluster supported-models tables and the compatibility matrix.

## Assets

- **Fonts**: All from Google Fonts. Source Serif 4 (multiple weights + italics), IM Fell English SC (small caps display), JetBrains Mono. Preconnect tags are in `Garden Atlas.html`.
- **Imagery**: None. The Almanac is intentionally typographic. The only "graphics" are SVG ornaments drawn inline:
  - `Ornament.Rule` — diamond + hairline rule (in `ornaments.jsx`)
  - `LatticeCartouche` — 64×64 hex-graph motif (`architectures.jsx`)
  - The Map's 2D embedding SVG (`atlas.jsx`)
- **Icons**: None. Status glyphs are Unicode (`●` `◐` `○`).

## Files

The `screenshots/` folder contains a high-quality PNG of every artboard, named to match the file/section structure (`01-frontispiece.png` through `12-compatibility-matrix.png`). Use these as visual references; the source HTML is the ground truth for measurements.

The following source files are included. All `.jsx` files are React components transpiled in the browser via Babel — port them to your framework's native component format.

- `Garden Atlas.html` — entrypoint; loads fonts, CSS, React, and all `.jsx` modules.
- `almanac.css` — the entire design-token + utility-class layer (`.page`, `.folio`, `.running-head`, `.almanac` table, `.fam-table`, `.body-prose`, `.cmd`, `.ink-link`, `.sc`, `.it`, etc.).
- `app.jsx` — top-level layout: places each page inside a `<DCArtboard>` of the `<DesignCanvas>` for review.
- `design-canvas.jsx` — the artboard/canvas presentation chrome (review tooling, not part of the production design).
- `frontispiece.jsx` — cover page.
- `about.jsx` — about spread.
- `atlas.jsx` — §02 The Map (embedding visualization).
- `cultivation.jsx` — §04 Cluster pages (`ClusterPage`, `ClusterSupportedPage`, `CLUSTER_RECORDS`, `STATUS_ORDER`).
- `datasets.jsx` — §05 Datasets (`DatasetsIndexPage`, `DatasetDetailPage`, `DATASET_RECORDS`, `MODEL_TRAINING_DATA`, `DATASET_EDITORIAL`).
- `architectures.jsx` — §06 Architectures (`ArchitecturesPage`, `FAMILIES`, `MODEL_META`, `LatticeCartouche`, `FamilyCapsule`).
- `compatibility.jsx` — Compatibility Matrix.
- `model-page.jsx` — model detail page template.
- `ornaments.jsx` — small SVG ornaments (`Ornament.Rule`, etc.).

## Recommended Implementation Order

1. **Tokens + chrome**: port `almanac.css` to the target framework's styling layer first (CSS modules, Tailwind config, Vanilla Extract, etc.). Get a `.page` shell rendering at 880×1120 with running head + folio.
2. **Data layer**: port `MODEL_META`, `FAMILIES`, `DATASET_RECORDS`, `MODEL_TRAINING_DATA`, `CLUSTER_RECORDS` to typed modules.
3. **Static editorial pages** (Frontispiece, About) — easy wins to validate the type system.
4. **Tables-only pages** (Datasets index, Compatibility Matrix) — exercise the table styles.
5. **Detail templates** (Dataset detail, Cluster spread, Model detail) — these reuse the marginalia + reverse-index patterns; building them in this order means the third one is mostly recombination.
6. **Architectures spread** — straightforward once the pattern is set.
7. **The Map** — most custom work; an SVG visualization with real layout. Save for last.
8. **Print stylesheet** — use the existing 880×1120 dimensions as `@page` size.

## Notes for the implementer

- **Don't fight the spec on density.** Several pages are tuned to fit exactly within 1120px. Padding, font sizes, and row heights have been adjusted iteratively to make this work. Match them.
- **The `.fam-table` selector exists for a reason.** The Architectures capsule tables use 2.5px row padding instead of 5px. Without it, the Message-Passing capsule (9 models) overflows the page.
- **Anchor every cross-reference.** The reading experience depends on being able to jump from "ANI-2x" in a table → the model page → the dataset it was trained on → the architecture family it belongs to, in a single click each. Don't paraphrase model names as plain text.
- **Tabular-nums on every numeric column.** The Almanac's tables are alignment-sensitive.
- **Text-wrap: pretty** is set globally in `almanac.css`. Keep it; it's part of the typographic feel.
