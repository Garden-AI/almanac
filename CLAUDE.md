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
- `Model.family` → `architectures` collection
- `Model.trainingData[].dataset` → `datasets` collection
- `Model.rootstockEnv` → string key into Rootstock's `environments` (see below)

### Rootstock seam (the most non-obvious part)
The Rootstock bulk-dump returns **per-cluster manifests**, where each manifest has `environments` keyed by names like `uma_env`, `mace_env`, `chgnet_env`. These are *environment groups* (a Python env with the right deps for a model family), not individual model variants. The cell at (model × cluster) in the compatibility matrix is computed:

```ts
manifests.find(m => m.cluster === clusterSlug)
  ?.environments[model.rootstockEnv]  // → { status, built_at, ... } | undefined
```

`undefined` = "n/a" (cluster doesn't carry that env). `status: "ready"` = verified.

The client lives in `src/lib/rootstock.ts`. By default it reads from a captured fixture at `src/fixtures/rootstock-dump.json` (build is offline-clean). Set `ROOTSTOCK_URL` in `.env` to fetch live. `checkpoints[]` is empty in the current Rootstock dump — presumably will populate with per-checkpoint info later; the schema allows for it.

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
- **Status glyphs are Unicode**: `●` verified, `◐` stale, `○` n/a.
- **Don't invent new colors.** Tokens in `almanac.css` were tuned for the paper feel.
