# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The production site for **thegardens.ai**'s *Garden's Almanac of Matter Models, 2026 Edition* — a long-form, almanac-styled web publication cataloging machine-learning interatomic potentials (MLIPs), their training datasets, the HPC clusters they run on, and the architectural families they belong to.

Built as an **Astro 6** static site. Editorial content lives in the repo (no DB) — community PRs are the editing path. Live cluster availability comes from **Rootstock**, the existing backend at `https://garden-ai-prod--rootstock-admin-dashboard.modal.run/`.

`design_handoff_garden_almanac/` is the original pixel-perfect design reference (HTML+JSX prototypes, never built). Don't ship from there — port from there. `design_handoff_garden_almanac/README.md` is still the canonical source for typography, layout dimensions, and the design rationale.

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

- **Catalog identity is build-time.** Which clusters, models, checkpoints, datasets, architectures *exist as pages or rows* comes from `src/content/**` and is baked at build. The live script cannot conjure a row or column that wasn't rendered. If Rootstock starts reporting a cluster (e.g. `polaris`) or a checkpoint that has no JSON entry, it's silently invisible everywhere — except `/cluster/[slug]`, whose "Available checkpoints" section iterates the live manifest directly.
- **Status is live.** Cell glyphs, verified/lapsed/na counts, family/cluster row totals, and any visibility decision driven by "does this currently have a record in Rootstock" must be re-derived in the client script. The server render should produce a best-effort placeholder (build-time dump as the seed) plus `data-rs-*` hooks so the script can rewrite it.

A footgun this rule exists to prevent: filtering rows or columns at build time based on Rootstock state. The live script can update the cells of a row that's in the DOM, but it can't bring back a row that was filtered out — so a stale build masks new verifications until the next deploy. Always render the row/column, give it `am-hidden` based on build-time data, and let the script toggle that class from live data.

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

Pages following this pattern as of this writing: `pages/index.astro` (matrix + mobile cluster cards), `pages/model/[slug].astro`, `pages/clusters.astro`. `pages/cluster/[slug].astro` is the simpler case — its script rewrites the whole "Available checkpoints" section wholesale.

### Page chrome
`src/layouts/Page.astro` is the shared shell: running head + folio + paper background, wrapping a `<slot />`. Loads Google Fonts (Source Serif 4, IM Fell English SC, JetBrains Mono). All design tokens live in `src/styles/almanac.css` as `:root` custom properties.

### Routes
- `/` — index (links to all entities)
- `/model/[slug]` — model detail
- `/dataset/[slug]` — dataset detail with reverse-index of models trained on it
- `/cluster/[slug]` — cluster page; reads live env status from Rootstock, plus a `<details>` listing all envs (including ones no catalog model claims yet)
- `/architecture/[slug]` — family page

Each is currently scaffolded with one example record (UMA Medium, OMat24, Della, Equivariant). Adding more is a matter of dropping JSON files into `src/content/{type}/`.

## Editing rules (from the design handoff)

- **No shadows, no border-radius, no gradients.** The almanac aesthetic is paper-and-ink — hairline rules only.
- **Tabular-nums on every numeric column.**
- **Anchor every cross-reference.** Model/dataset/cluster names in tables render as `<a class="ink-link" />`.
- **Status glyphs are Unicode**: `●` verified within thirty days, `○` installed but not recently verified (covers stale and errored), `—` not installed. Half-moon (`◐`) is removed.
- **Don't invent new colors.** Tokens in `almanac.css` were tuned for the paper feel.
