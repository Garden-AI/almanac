---
name: almanac-model-draft
description: Draft a Garden's Almanac model entry. Use when the operator asks to "draft a model page", "add a model to the almanac", or similar — given a paper (DOI / arXiv ID / PDF / URL) plus weights and code links. Produces src/content/models/{slug}.json and src/content/papers/{slug}.json stubs that pass the schema.
---

# Garden's Almanac — Model entry author

You're drafting a new model entry for the Garden's Almanac (`thegardens.ai`). The operator gives you a brief like:

```
Paper:  arXiv:2506.23971  (or a DOI, PDF path, or URL)
Weights: https://huggingface.co/facebook/UMA
Code:    https://github.com/facebookresearch/fairchem
Family hint: equivariant   (optional; may be blank)
```

You produce two files (and only these files):

- `src/content/models/{slug}.json` — the model entry
- `src/content/papers/{slug}.json` — a paper stub (`{ "doi": "...", "source": "fetched" }`)

Output is reviewed and committed by a human. You are a draft-writer, not a publisher.

## Schema (authoritative copy in `src/content.config.ts`)

```ts
Model = {
  name: string,
  families: Array<reference('architectures')>.min(1),   // operator sets this
  releaseDate?: string,                                  // ISO YYYY-MM-DD; leave blank
  paperRefs: Array<reference('papers')>,                 // slugs of stubs you create
  codeUrl?: string,
  huggingFaceId?: string,                                // e.g. "facebook/UMA"
  weightsUrl?: string,                                   // fallback if no HF
  cachePath?: string,                                    // operator only — leave blank
  checkpoints: Array<{
    id: string,                                          // mono identifier from the model card
    params?: string,                                     // "150M", "1.4B"
    weightsBytes?: number,                               // operator measurement — leave blank
  }>.min(1),
  trainingData: Array<reference('datasets')>,            // existing dataset slugs ONLY
  notes?: string,                                        // leave blank — editorial content
}

Paper = {
  doi?: string,
  title?, authors?, published?, venue?, url?, citation?,
  source: 'fetched' | 'manual',
}
```

## What you populate confidently

From the paper / HF model card:

- `name` — model name as the paper or HF card writes it ("UMA", "MACE-OFF23", "Orb-v2"). Use the human-facing name, not the HF id.
- `codeUrl`, `huggingFaceId` (or `weightsUrl`) — straight from the brief.
- `checkpoints[].id` — the canonical checkpoint identifier(s) listed on the HF model card or in the paper's release artifacts. Use the exact ids — they have to match what Rootstock has installed.
- `checkpoints[].params` — only when stated. "150M", "1.4B". Don't compute from layer counts.
- `trainingData[]` — only when the dataset slug already exists in `src/content/datasets/`. Read the dir first. Map paper-mentioned datasets ("OMat24", "OC20", "MPtrj") to existing slugs (`omat24`, `oc20`, `mptrj`). If the paper trains on something not in the catalog, **leave it out** and mention it in your summary.
- `paperRefs` — slug pointing at the paper stub you create in this same run (typically `[slug]` matching the model slug, but use a different slug if the paper is reused across models — e.g. a shared dataset paper).

## What you leave blank

- `families` — taxonomy choice belongs to the human curator. The brief may include a hint; suggest one in your summary either way, but **do not write the field**.
- `cachePath` — operator-only. Comes from running the env, not the paper.
- `weightsBytes` — operator measurement.
- `releaseDate` — leave unset. The catalog sort and masthead date fall back to `paper.published` once the fetcher runs.
- `notes` — operator-authored. Empty by default.

## Hard rules

1. **Never invent fields you can't ground.** If the paper doesn't say it, the field is omitted, not guessed.
2. **Never invent slugs.** Every reference (`trainingData[]`, `families[]` if you ever populate it, `paperRefs[]`) must point at an entity that exists or a stub you create in this run. Read `src/content/datasets/` and `src/content/architectures/` first.
3. **Never modify existing files.** Only add new ones.
4. **Never write performance commentary or "when to use" recommendations** anywhere — not in `notes`, not in your summary. The Almanac catalogues; it does not editorialise.
5. **Never write `notes` content.** Operator-authored only.
6. **Confirm the paper DOI before writing the stub.** If the brief gives an arXiv ID, the stub uses `10.48550/arXiv.{id}`. If the brief gives a DOI directly, use it verbatim. Do not guess from the paper title — `npm run fetch:papers` will fail loudly if the DOI is wrong, but garbage-in is still cheaper to catch before committing.
7. **One run = one model.** Don't draft multiple models in a single invocation; the operator review step doesn't scale.

## Workflow

1. **Read the paper.** Use WebFetch on the DOI / arXiv abs URL, or Read on a local PDF. Pull: title, author list (for citation cross-check only — the fetcher fills `authors`), checkpoint ids, params, training datasets.
2. **Read the HF model card** (if HF id given). It's often the most reliable source of checkpoint ids — papers describe one canonical model, the HF release packages multiple checkpoints.
3. **Read `src/content/datasets/`** to enumerate existing dataset slugs. Match paper-mentioned datasets only to existing slugs.
4. **Read `src/content/architectures/`** to enumerate family slugs (for the summary suggestion).
5. **Decide the model slug.** Lower-case, hyphen-separated. Match how operators would refer to the model (`uma`, `mace-mp-0`, `mace-off23`, `orb-v2`). Skim `src/content/models/` to avoid collisions.
6. **Write `src/content/papers/{slug}.json`** with just `{ "doi": "...", "source": "fetched" }`. The fetcher enriches this in step 9.
7. **Write `src/content/models/{slug}.json`.** Match the JSON style of existing entries (2-space indent, top-level keys in schema order).
8. **Summarise.** In your final message:
    - What you populated.
    - What you deliberately left blank and why (especially `families` — give a suggestion).
    - What the paper trains on that *isn't* in the catalog yet (so the operator can decide whether to add those datasets).
    - The next-steps the operator runs: set `families`, `npm run fetch:papers`, `npm run build`, eyeball `/model/{slug}`, fill `cachePath`/`weightsBytes`/`notes` if relevant, commit.

## Calibration: UMA worked example

Operator brief:
```
Paper:   https://doi.org/10.48550/arXiv.2506.23971
Weights: https://huggingface.co/facebook/UMA
Code:    https://github.com/facebookresearch/fairchem
```

Expected `src/content/papers/uma.json`:
```json
{
  "doi": "10.48550/arXiv.2506.23971",
  "source": "fetched"
}
```

Expected `src/content/models/uma.json` (approximately — checkpoint ids and training dataset list come from reading the paper and HF card):
```json
{
  "name": "UMA",
  "families": [],
  "huggingFaceId": "facebook/UMA",
  "codeUrl": "https://github.com/facebookresearch/fairchem",
  "paperRefs": ["uma"],
  "checkpoints": [
    { "id": "uma-s-1p1", "params": "150M" }
  ],
  "trainingData": ["omol25", "oc20", "omat24", "odac25", "omc25"]
}
```

Expected summary tail:
> Drafted `src/content/models/uma.json` and `src/content/papers/uma.json`.
>
> **Left blank deliberately:**
> - `families` — suggest `["equivariant"]` based on the paper's architecture description; please confirm.
> - `releaseDate`, `cachePath`, `weightsBytes`, `notes` — operator/post-fetch.
>
> **Dataset references:** the paper trains on OMol25, OC20, OMat24, ODAC25, OMC25. ODAC25 and OMC25 are not yet catalogued in `src/content/datasets/` — Astro will warn at build but won't fail. Add those datasets if you want the cross-references resolved.
>
> **Next:** set `families`, `npm run fetch:papers`, `npm run build`, visit `/model/uma`. Fill `cachePath` / `weightsBytes` / `notes` from running the env.

The agent matches this UMA draft (modulo additional checkpoints if the HF release lists more — `uma-s-1p1` is one of several in the actual UMA release; if the model card lists `uma-m-1p0`, `uma-m-1p1`, etc., include them all with their stated params).

## Anti-patterns (don't do these)

- Reading `CLAUDE.md` and copy-pasting "the almanac aesthetic is paper-and-ink" into your summary — that's design, not a model entry.
- Filling `families` because you "know" the architecture from the paper — that's the curator's call.
- Inventing a dataset slug like `"matpes-pbe"` because the paper mentions MatPES but no such slug exists. Either find the actual slug or omit.
- Filling `notes` with "trained on a 5M-sample subset" — that's performance/scope commentary and belongs to the paper, not the entry.
- Drafting two models in one run because the paper introduces a small and large variant. They're separate entries with separate operator reviews.
