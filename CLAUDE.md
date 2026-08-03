# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The production site for **thegardens.ai**'s *Garden's Almanac of Matter Models, 2026 Edition* — a long-form, almanac-styled web publication cataloging machine-learning interatomic potentials (MLIPs), their training datasets, the HPC clusters they run on, and the architectural families they belong to.

Built as an **Astro 6** static site. Editorial content lives in the repo (no DB) — community PRs are the editing path. Live cluster availability comes from **Rootstock**, the existing backend at `https://garden-ai-prod--rootstock-admin-dashboard.modal.run/`.

`docs/design-guidelines.md` is the canonical design reference — the paper-and-ink hard rules, the three-typeface system, and the layout conventions the site is built to. (It supersedes the original `design_handoff_garden_almanac/` prototype directory, which has been removed from the repo.)

## Commands

```sh
npm run dev      # localhost:4321
npm run build    # static output to dist/
npm run preview  # serve dist/
```

Node 22+ required (Astro 6 engine constraint).

## Architecture

### Data model (content collections)
Everything mutable-but-curated lives in `src/content/{models,datasets,clusters,architectures}/` as JSON, with Zod schemas in `src/content.config.ts`. Cross-references use Astro's `reference()` so the **build fails** on broken links (e.g., a model citing a dataset slug that doesn't exist). PRs that break the graph get clean CI errors instead of mystery runtime issues.

Schema relationships:
- `Model.families[]` → `architectures` collection
- `Model.trainingData[]` → `datasets` collection
- `Model.paperRefs[]` → `papers` collection

### Rootstock seam (the most non-obvious part)
The Rootstock bulk-dump returns **per-cluster manifests**, where each manifest has `environments` keyed by names like `uma_env`, `mace_env`, `orb_v3`. These are *environment groups* (a Python env with the right deps for a model family), each carrying a `checkpoints` map keyed by canonical checkpoint id. The cell at (cluster × checkpoint) in the compatibility matrix is computed by `findVerification` in `src/lib/rootstock.ts`: find the cluster's manifest, then iterate its envs looking for the checkpoint id. First match wins.

`null` from `findVerification` = "n/a" (no env on that cluster carries that checkpoint). A non-null result with a recent `verified_at` = verified; older or errored = lapsed.

The client lives in `src/lib/rootstock.ts`. By default it reads from a captured fixture at `src/fixtures/rootstock-dump.json` (build is offline-clean). Set `PUBLIC_ROOTSTOCK_URL` in `.env` (or in the deploy env) to fetch live — the `PUBLIC_` prefix is required so Astro exposes it to both the build-time render and the client-side refresh bundle.

#### Build-time vs. live: what belongs where

The site is statically built (GitHub Pages), but every page that renders Rootstock data also runs a client-side `loadLiveDump()` refresh on load. The rule that keeps stale builds from stranding real data:

- **Catalog identity is build-time.** Which clusters, models, checkpoints, datasets, architectures *exist as pages or rows* comes from `src/content/**` and is baked at build. The live script cannot conjure a row or column that wasn't rendered. If Rootstock starts reporting a cluster (e.g. `polaris`) or a checkpoint that has no JSON entry, it's silently invisible everywhere.
- **Status is live.** Cell glyphs, verified/lapsed/na counts, family/cluster row totals, and any visibility decision driven by "does this currently have a record in Rootstock" must be re-derived in the client script. The server render should produce a best-effort placeholder (build-time dump as the seed) plus `data-rs-*` hooks so the script can rewrite it.

A footgun this rule exists to prevent: filtering rows or columns at build time based on Rootstock state. The live script can update the cells of a row that's in the DOM, but it can't bring back a row that was filtered out — so a stale build masks new verifications until the next deploy. Always render the row/column, give it `am-hidden` based on build-time data, and let the script toggle that class from live data.

#### Unlisted clusters (the `?gotigers=true` unlock)

A cluster entry with `"unlisted": true` (e.g. `della` — restricted allocations, project-only install) renders everywhere like any other cluster but its elements carry `am-unlisted`, hidden by CSS until the viewer visits any page with `?gotigers=true` (persisted in localStorage; `?gotigers=false` relocks; a pre-paint inline script in `Page.astro` stamps `.gotigers` on `<html>`). Two invariants when touching cluster-rendering code:

- `am-unlisted` is orthogonal to `am-hidden` — build-time, both may apply; never merge them. `am-hidden` means "no live presence"; `am-unlisted` means "viewer hasn't unlocked".
- Any "does anyone support this?" aggregation (row dimming on the index, `anyPresence` on model pages, env-file tab sets) must exclude unlisted clusters unless the unlock is active — otherwise an unlisted-only checkpoint leaks an all-hatched row or an empty-but-rendered table to regular viewers. Both build-time seeds (egg-off baseline) and live-refresh scripts (check `html.gotigers`) follow this.

Pattern, in shorthand:

```astro
<tr class:list={[!hasLivePresence && "am-hidden"]} data-rs-row={cp.id}>
  {clusters.map(c => (
    <td data-rs-cell={`${c.id}:${cp.id}`} set:html={cellSvg(buildTimeState)} />
  ))}
</tr>
```

```ts
loadLiveDump().then(dump => {
  // recompute state per cell, toggle am-hidden on the row from live data
});
```

Pages following this pattern as of this writing: `pages/index.astro` (matrix + mobile cluster cards) and `pages/model/[slug].astro`. `pages/clusters.astro` is the simpler case — its script rewrites each cluster's models region wholesale (`renderClusterModelsHtml` emits identical markup at build seed and live refresh).

### Page chrome
`src/layouts/Page.astro` is the shared shell: running head + folio + paper background, wrapping a `<slot />`. Loads Google Fonts (Source Serif 4, IM Fell English SC, JetBrains Mono). All design tokens live in `src/styles/almanac.css` as `:root` custom properties.

### Typography system
Three faces, **one job each** — keep them in their lanes or the page reads as noise:
- **Source Serif 4** (`--serif`) → reading + identity: H1s, body copy, **and model names in the matrix** (the table's primary scan target — serif 600, near-zero tracking, so it out-reads the mono IDs beneath it).
- **IM Fell English SC** (`--smallcaps`, via the `.sc` helper) → labels, nav, and section heads: masthead wordmark/nav, column headers, eyebrows, the legend, and `.section-head`. Set label text in **true lowercase** so it renders as uniform small caps (no oversized initial cap).
- **JetBrains Mono** (`--mono`) → data only: checkpoint IDs, GPU types, code. (The matrix's lowercase **checkpoint** sub-header is deliberately mono too, mirroring the IDs it labels — the one intentional exception to "column heads are IM Fell SC".)
- **Oxblood** (`--oxblood`) → links + verified/lapsed status marks only. Never decoration.

Small-caps tracking comes from two tokens, **never ad-hoc em values**: `--track-label` (0.08em) for table/label uses, `--track-display` (0.14em) for masthead nav + eyebrows.

**Type sizes come from the `--fs-*` scale** in `:root` (`--fs-micro` … `--fs-display`), **not ad-hoc px**. Reach for a token; if nothing fits, the scale is probably wrong — fix the token, don't add a one-off px. The **primer wing** (`primer.css`) intentionally keeps its own scale and is out of this system. One deliberate exception remains inline: the mobile `h1` override (30px) — a responsive breakpoint value, not a scale step.

Two sitewide structural classes in `almanac.css` — use them, don't restyle per page:
- **`.page-dek`** — the one-sentence framing line directly under every page H1 (`--fs-lg`, roman, `--ink-2`, 62ch). Every catalog page has one; it may carry inline `.ink-link` anchors (on `/models` it doubles as the section nav).
- **`.double-rule` + `.section-head`** — the "new section starts here" furniture: a double rule, then a small-caps head naming the section when a page has more than one (`/models`' three arrangements, the index's "Running a model"). `/datasets` uses the rule alone — single-section page, nothing to name.

### Routes
- `/` — the availability matrix (checkpoint × cluster status), mobile cluster cards, and the "Running a model" how-to
- `/models` — the model landscape three ways: similarity tree, architecture-family cards, publication-year list
- `/model/[slug]` — model detail
- `/datasets` — one section per dataset (the "Architecture Families" pattern, not a list+detail). Only renders datasets at least one catalog model trained on; sections carry `id={slug}` anchors. There is **no** `/dataset/[slug]` detail route — the model page's "Trained on" links point at `/datasets#<slug>`.
- `/clusters` — one section per cluster with live model/checkpoint status from Rootstock; sections carry `id={slug}` anchors and auto-expand on hash navigation. There is **no** `/cluster/[slug]` detail route.

Architecture families have **no detail route** — they render only as the "Architecture Families" section on `/models`, sourced from the `architectures` collection (`name` + `brief` + example paper). Each family card carries an `id={slug}` anchor, and each model's "Family" field links to `/models#<slug>`.

Adding records is a matter of dropping JSON files into `src/content/{type}/`.

## Editing rules (from the design handoff)

- **No shadows, no border-radius, no gradients.** The almanac aesthetic is paper-and-ink — hairline rules only.
- **Tabular-nums on every numeric column.**
- **Anchor every cross-reference.** Model/dataset/cluster names are links. Prose uses `.ink-link` (persistent oxblood underline); dense tables use a hover-reveal underline instead (`.am-slug-link`, `.am-cluster-link`, `.am-fhead-name`) so the matrix stays calm at rest. No element carries a resting link indicator inside the matrix.
- **A checkpoint id names weights, nothing else.** Heads, model inputs, and licenses are *curated catalog facts* in the model JSON (`checkpoints[].heads`, `checkpoints[].modelInputs`, model-level `license`), never encoded into checkpoint ids and never derived from Rootstock (which stays pure mechanics; it enforces the license gate separately). The two run-time mechanisms are distinct — get them right in any copy or snippet (see Rootstock `docs/api.md`): heads are picked at calculator construction via `setup_kwargs={"task": "omol"}` (kwarg name is upstream-faithful: UMA `task`, MACE-MH1 `head`); model inputs (`charge`, `spin`, `external_field`, …) are per-calculation physics set on `atoms.info` and forwarded *untouched* with every calculation — that's the model's own interface, Rootstock just gets out of the way (never claim Rootstock defaults or intercepts them; the setup-args table on the model page is Rootstock-specific, model inputs stay prose). Head names track training corpora, so each head carries a `dataset` reference — heads are linkable catalog objects, not opaque strings. Rendering: **words, not symbols** (a `±`/`§` glyph pass was tried and rejected — unkeyed marks read as noise). The matrix states a family's head roster once, on its own line in the family header (`.am-fhead-heads` — "task heads" label + head names, nothing more; no hover titles, no inline gloss — the model page's `#heads` table is where heads get explained), each head linking to the model page as `?head={id}`, whose **only** effect there is pre-filling that head in the run snippet (client-side re-render from a template; no on-page picker UI — a clickable heads table was tried and rejected); never a roster per checkpoint row, and one status row per checkpoint, because verification is per checkpoint, never per head. Head names join the matrix search index. The model page: model inputs surface **only** in the snippet — the `# this model accepts …` comment plus the `atoms.info` lines (a masthead "accepts" entry and a prose block were both tried and rejected); the "Running this model" section renders on **every** model page (the base cluster/checkpoint/device snippet is the almanac's core promise; a conditional section made absence ambiguous) — plain models get the snippet alone, and heads prose + heads table (task head | trained against, dataset link answering "what is omol?") layer on where curated. **License renders once, in the masthead**: `model.data.license` (populated catalog-wide; weights license, which can differ from the code repo's) shows as a "License" masthead entry — the license name linked to its canonical text, beside Weights — and nowhere else; `nonCommercial: true` marks academic-only releases (ASL) but adds no extra chrome (the name says it). The `NON_COMMERCIAL_USE` snippet acknowledgment is still a future pass alongside Rootstock's enforcement. The snippet block carries **no chrome bar/filename** — a `run_x.py` label was rejected because it implies a file that exists in the system, and only the env files below actually do.: *verified* (ran in last 30 days), *installed* (present but not recently verified — covers stale and errored), *not installed* (no env on that cluster carries the checkpoint). Matrix cells render these as SVG via `cellSvg` (filled dot / open circle / hatch); the mobile cluster cards use text `●` / `○` / `//`. Don't introduce new state names ("n/a", "not applicable", "lapsed") in user-facing copy — `lapsed`/`na` live in code only.
- **Bring-your-own-weights is a curated pseudo-checkpoint, not a checkpoint.** An env that accepts user fine-tunes declares one `<env>:custom` id (Rootstock's side: a `CHECKPOINTS` entry with value `None` plus the `setup_from_path` hook; `weights=` is a first-class calculator kwarg, not a setup_kwarg). The almanac curates that id as model-level `customCheckpoint` — shared verbatim by every model the env hosts (all six MACE entries carry `"mace:custom"`), and deliberately **not** a `checkpoints[]` entry, because it names no weights. Everything renders by the usual live rules — Rootstock verifies the id like any checkpoint, so it appears in the dump's checkpoints maps and the standard `findVerification` machinery applies; nothing shows until Rootstock reports it. Index matrix: one custom row per family section that curates the id (the bare mono id, **no gloss** — `<env>:custom` is self-describing, and an "your own fine-tune" italic was tried and rejected as too wordy; the row links to the model page as `?custom`), with per-cluster tallies deduped by checkpoint id in **both** the build seed and the live script (six rendered rows, one count). Model page: a last row in the checkpoint table (row-level `am-hidden` when no visible cluster reports it — unlike shipped rows, which always render) and a "pre-staged checkpoint / custom checkpoint" toggle on the run snippet (`.run-toggle`, reusing `.am-env-tab`, labels in true lowercase; the one sanctioned snippet control besides `?head=`) whose custom variant swaps in the `:custom` id plus `weights=YOUR_WEIGHTS_PATH`; `?custom` pre-sets it, and heads compose (`setup_kwargs` forwards to `setup_from_path`). Two footguns: `data-rs-cell` keys must split on the **first** colon only (custom ids contain one), and `/clusters` drops custom ids on purpose (orphans in its checkpoint→model index) pending a decision on how to attribute a shared id there.
- **Don't invent new colors.** Tokens in `almanac.css` were tuned for the paper feel.
