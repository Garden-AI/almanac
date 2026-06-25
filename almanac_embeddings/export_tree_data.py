"""
Export real representational-distance data for the similarity-tree page.

The tree-component prototype (design_handoff_similarity_tree/) builds its tree by
running neighbor-joining on *UMAP 2-D coordinates* — a tree of the picture, not
of the data. This emits the correct input instead: per dataset, the √JSD(CKNNA)
distance matrix (the metric behind the paper's Fig 1F, validated at cophenetic
stress ≈ 0.05 in mds_diag.py), joined to the canonical per-model metadata the
site already uses, plus a metadata-driven training-corpus bucket for leaf color.

No UMAP. Reuses the existing src/content/embeddings/*.json for the canonical leaf
set / order / slug links, and computes distances straight from _data/*/cknnas.json.

Output: src/data/tree-data.json  — consumed by src/pages/models-tree.astro.

Run:  uv run python export_tree_data.py
"""
import json
from pathlib import Path

import numpy as np

from mds_diag import DATA, d_authors, load_cknna, load_metadata

ALMANAC = Path(__file__).resolve().parent.parent
EMB_DIR = ALMANAC / "src" / "content" / "embeddings"
OUT = ALMANAC / "src" / "data" / "tree-data.json"

# dataset id -> cknnas.json subdir.  In-distribution (OMat24) first.
DATASETS = [("omat24", "OMat24"), ("omol25", "OMol25"), ("qm9", "QM9"), ("salex", "sAlex")]


def corpus_of(model_name, family, label, metadata):
    """Four-bucket training corpus, from real metadata (handoff §'while you're in
    the data'). OMPA unions fold into 'omat'. Fallback only for missing records."""
    rec = metadata.get(model_name)
    if rec:
        ds = [d.lower() for d in rec.get("dataset", [])]
        if any("mad" in d for d in ds):
            return "mad"
        if any("spice" in d for d in ds):
            return "spice"
        if any("omat" in d for d in ds):
            return "omat"
        if ds:
            return "mp"                       # MPtrj / sAlex / other PBE-MP materials
        dft = [d.lower() for d in rec.get("dft_level_of_theory", [])]
        if any("omat24" in d for d in dft):
            return "omat"
        if any("spice" in d for d in dft):
            return "spice"
        if any("mp" in d for d in dft):
            return "mp"
    # no metadata record — keep the heuristic narrow
    if family == "PET-MAD":
        return "mad"
    if family == "MACE" and "off" in (label or "").lower():
        return "spice"
    return "mp"


def main():
    metadata = load_metadata()
    out_datasets = []

    for ds_id, sub in DATASETS:
        emb = json.loads((EMB_DIR / f"map-{sub.lower()}.json").read_text())
        emb_points = emb["points"]

        # full similarity matrix (symmetric, diag 1), indexed by modelName
        labels_all, C_all = load_cknna(DATA / sub / "cknnas.json")
        pos = {m: i for i, m in enumerate(labels_all)}

        # keep exactly the canonical embedding leaves, in their order
        keep = [p for p in emb_points if p["modelName"] in pos]
        missing = [p["modelName"] for p in emb_points if p["modelName"] not in pos]
        if missing:
            print(f"  ! {ds_id}: {len(missing)} embedding models absent from CKNNA: {missing}")

        idx = [pos[p["modelName"]] for p in keep]
        C = C_all[np.ix_(idx, idx)]
        D = d_authors(C)                       # √JSD(CKNNA) — paper eqs A9–A12

        points = []
        for p in keep:
            mn = p["modelName"]
            points.append({
                "modelName": mn,
                "label": p["label"],
                "family": p["family"],
                "corpus": corpus_of(mn, p["family"], p["label"], metadata),
                "sizeM": p.get("sizeM"),
                "numParams": p.get("numParams"),
                "slug": p.get("slug"),
            })

        out_datasets.append({
            "id": ds_id,
            "dataset": emb["dataset"],
            "metric": "√JSD(CKNNA) at k=25 (paper eqs A9–A12)",
            "n": len(points),
            "points": points,
            "labels": [p["label"] for p in points],          # leaf identity & matrix order
            "matrix": [[round(float(v), 5) for v in row] for row in D],
        })

        corpus_counts = {}
        for p in points:
            corpus_counts[p["corpus"]] = corpus_counts.get(p["corpus"], 0) + 1
        print(f"  ✓ {ds_id}: n={len(points)}  corpus={corpus_counts}")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"datasets": out_datasets}, indent=2) + "\n")
    print(f"\nwrote {OUT.relative_to(ALMANAC)}")


if __name__ == "__main__":
    main()
