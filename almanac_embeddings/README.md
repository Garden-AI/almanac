# Almanac embeddings pipeline

Generates the UMAP layouts that drive the Garden's Almanac
[map view](../src/pages/map.astro). For each reference dataset, projects the
pairwise CKNNA distance matrix between MLIPs to 2D and writes JSON the Astro
site picks up via the `embeddings` content collection.

```
export_layouts.py   # the pipeline (loaders + exporter, single file)
_data/              # input pairwise metrics (gitignored — see below)
```

## Inputs

`_data/` holds pre-computed pairwise CKNNA similarity for the foundation-model
ecosystem, derived from work by Edamadaka et al. (*Universally Converging
Representations of Matter Across Scientific Foundation Models*, arXiv:
2512.03750). It is **not committed** while the paper is under review. To
re-run the pipeline you'll need:

```
_data/
├── model_metadata.json
└── {OMol25,OMat24,QM9,sAlex}/cknnas.json
```

Get these from the upstream embedding-study repo.

## Setup

```sh
uv venv
uv pip install numpy pandas scipy scikit-learn umap-learn
```

## Run

```sh
uv run python export_layouts.py                # OMol25 only (the default)
uv run python export_layouts.py --dataset all  # all four reference datasets
```

Outputs land in `../src/content/embeddings/map-{dataset}.json`. The Astro
site's `embeddings` schema validates the structure and resolves the optional
`slug` field as a `reference('models')`, so a layout pointing to a non-existent
model fails the build.

## Scope

MLIPs only for now. LLMs, protein models, and molecular language models that
appear in the upstream study are filtered out at export time
(`NON_MLIP_ARCHS` in `export_layouts.py`). PET-MAD is included and gets its
own family.
