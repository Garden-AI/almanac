"""
Emit a UMAP layout of CKNNA distances for the Garden's Almanac map view.

For each model in `_data/{dataset}/cknnas.json`, write the UMAP coords plus
parsed family/variant/size and (if recognised) the almanac slug it links to.
The Astro site reads the resulting JSON via a content collection so broken
slug references fail the build.

Run from this directory:
    uv run python export_layouts.py                  # default: OMol25
    uv run python export_layouts.py --dataset all    # all four datasets

The `_data/` inputs are not committed (they're derived from model weights
held back during paper review). Obtain them from the upstream embedding-
study repo before running.
"""
import argparse
import ast
import json
import re
from pathlib import Path

import numpy as np
import pandas as pd
import umap


# ---------------------------------------------------------------------------
# CKNNA loader + model-name parser. Adapted from the upstream embedding-
# study repo (Edamadaka et al., arXiv:2512.03750), trimmed to what the
# almanac map exporter actually needs.
# ---------------------------------------------------------------------------

def load_cknna_distance_matrix(path: str | Path, k: str = "25") -> pd.DataFrame:
    """
    Load `cknnas.json` and return a symmetric model x model distance matrix.

    Keys are stringified `(model_a, model_b)` tuples; values are
    `{"<k>": similarity}`. Distance = 1 - similarity. Models with any
    missing pairwise entries at the requested `k` are dropped.
    """
    data = json.loads(Path(path).read_text())
    pairs = []
    models: set[str] = set()
    for key, value in data.items():
        a, b = ast.literal_eval(key)
        models.add(a); models.add(b)
        if k not in value:
            continue
        pairs.append((a, b, 1.0 - float(value[k])))

    idx = sorted(models)
    D = pd.DataFrame(np.nan, index=idx, columns=idx, dtype=float)
    for m in idx:
        D.loc[m, m] = 0.0
    for a, b, dist in pairs:
        D.loc[a, b] = dist
        D.loc[b, a] = dist
    return D.dropna(axis=0, how="any").dropna(axis=1, how="any")


def parse_model(name: str) -> dict:
    """Extract family / variant / size_M / training-dataset from a model id."""
    n = name.lower()

    if n.startswith("eqv2_dens"):
        family, variant = "eqV2", "dens"
    elif n.startswith("eqv2"):
        family, variant = "eqV2", "base"
    elif n.startswith("esen"):
        family, variant = "eSEN", "base"
    elif n.startswith("mace"):
        if "equivariant" in n:
            family, variant = "MACE", "equivariant"
        elif "invariant" in n:
            family, variant = "MACE", "invariant"
        else:
            family, variant = "MACE", "base"
    elif n.startswith("orb"):
        family = "ORB"
        if "conservative" in n:
            variant = "conservative"
        elif "direct" in n:
            variant = "direct"
        elif n == "orbv2":
            variant = "v2"
        else:
            variant = "base"
    elif n.startswith("uma"):
        family, variant = "UMA", "base"
    else:
        family, variant = "other", "base"

    # Best-effort size hint from the name; metadata is preferred when known.
    size_M = None
    m = re.search(r"(\d+)\s*[Mm]\b", name)
    if m:
        size_M = int(m.group(1))
    elif "small" in n:
        size_M = 5
    elif "medium" in n:
        size_M = 15
    elif "large" in n:
        size_M = 50

    if "omat_mp_salex" in n:
        dataset = "omat_mp_salex"
    elif re.search(r"_omat(\b|_)", n):
        dataset = "omat"
    elif re.search(r"_mptrj\b", n):
        dataset = "mptrj"
    elif re.search(r"_mpa\b", n):
        dataset = "mpa"
    elif re.search(r"_oam\b", n):
        dataset = "oam"
    elif re.search(r"_mp\b", n):
        dataset = "mp"
    else:
        dataset = "unknown"

    return {"family": family, "variant": variant, "size_M": size_M, "dataset": dataset}


def parse_models(names) -> pd.DataFrame:
    return pd.DataFrame({n: parse_model(n) for n in names}).T


# ---------------------------------------------------------------------------
# Exporter
# ---------------------------------------------------------------------------


REPO_ROOT = Path(__file__).resolve().parent
ALMANAC_ROOT = REPO_ROOT.parent
MODELS_DIR = ALMANAC_ROOT / "src" / "content" / "models"
OUT_DIR = ALMANAC_ROOT / "src" / "content" / "embeddings"

DATASETS = ["OMol25", "OMat24", "QM9", "sAlex"]


def normalize(s: str) -> str:
    return re.sub(r"[^a-z0-9]", "", s.lower())


def build_slug_index() -> list[tuple[str, str]]:
    """Return [(normalized_checkpoint_id, slug)] sorted longest-first."""
    pairs: list[tuple[str, str]] = []
    for f in sorted(MODELS_DIR.glob("*.json")):
        slug = f.stem
        data = json.loads(f.read_text())
        for ckpt in data.get("checkpoints", []):
            cid = ckpt.get("id")
            if cid:
                pairs.append((normalize(cid), slug))
    pairs.sort(key=lambda p: len(p[0]), reverse=True)
    return pairs


def slug_for(model_name: str, slug_index: list[tuple[str, str]]) -> str | None:
    """Match a boss-side `model_name` to an almanac slug, if any."""
    nm = normalize(model_name)
    for ckpt_norm, slug in slug_index:
        if ckpt_norm and ckpt_norm in nm:
            return slug
    return None


def load_metadata() -> dict[str, dict]:
    """model_name -> full metadata record (with `label` injected)."""
    meta = json.loads((REPO_ROOT / "_data" / "model_metadata.json").read_text())
    return {v["model_name"]: {"label": k, **v}
            for k, v in meta.items() if "model_name" in v}


# Almanac is MLIPs-only for now; everything else (LLMs, protein models,
# molecular LMs, the random baseline) is dropped at export time.
NON_MLIP_ARCHS = {
    "DeepSeek", "Qwen3", "GPT", "ChemBERTa", "ChemGPT", "Molformer",
    "Geom2Vec", "ESM2", "ESMC", "ESM3", "ESM IF", "ProteinMPNN", "ProstT5",
    "Randomized",
}


def is_mlip(model_name: str, metadata: dict[str, dict]) -> bool:
    rec = metadata.get(model_name)
    if not rec:
        # Unknown to metadata — keep it; parse_model will decide a family.
        return True
    archs = rec.get("architecture", [])
    if any(a in NON_MLIP_ARCHS for a in archs):
        return False
    modality = rec.get("modality", [])
    # MLIPs are 3D-only. Sequence/Structure/String are protein/molecule LMs.
    if modality and not any(m == "3D" for m in modality):
        return False
    return True


def family_from_metadata(model_name: str, metadata: dict[str, dict]) -> str | None:
    """Override family for MLIPs the parser tags as 'other' (e.g. PET-MAD)."""
    rec = metadata.get(model_name)
    if not rec:
        return None
    archs = rec.get("architecture", [])
    return archs[0] if archs else None


def export_one(dataset: str, slug_index, metadata):
    src = REPO_ROOT / "_data" / dataset / "cknnas.json"
    if not src.exists():
        print(f"  skip {dataset}: {src} missing")
        return

    D = load_cknna_distance_matrix(str(src), k="25")

    keep = [m for m in D.index if is_mlip(m, metadata)]
    dropped = [m for m in D.index if m not in keep]
    if dropped:
        print(f"    filtered out {len(dropped)} non-MLIP models: "
              + ", ".join(sorted(dropped)[:6])
              + (f" (+{len(dropped) - 6} more)" if len(dropped) > 6 else ""))
    D = D.loc[keep, keep]

    # n_neighbors must be < n_samples; clamp for the smaller MLIP-only subsets.
    n_neighbors = min(10, max(2, len(D) - 1))
    reducer = umap.UMAP(
        metric="precomputed",
        n_neighbors=n_neighbors,
        min_dist=0.25,
        random_state=0,
    )
    coords = reducer.fit_transform(D.values)

    # Normalize to [0,1] with a small margin so points don't kiss the edges.
    xs, ys = coords[:, 0], coords[:, 1]
    def norm(v):
        lo, hi = float(np.min(v)), float(np.max(v))
        if hi - lo < 1e-9:
            return np.full_like(v, 0.5, dtype=float)
        u = (v - lo) / (hi - lo)
        return 0.05 + 0.90 * u
    xs_n, ys_n = norm(xs), norm(ys)

    meta = parse_models(D.index)

    points = []
    linked = 0
    for i, name in enumerate(D.index):
        row = meta.loc[name]
        slug = slug_for(name, slug_index)
        if slug:
            linked += 1
        rec = metadata.get(name, {})
        # Prefer authoritative param count from metadata over the parsed
        # size hint, which only catches "153M"/"86M" suffixes etc.
        if "num_params" in rec:
            size_M = round(rec["num_params"] / 1e6, 1)
        else:
            raw = row["size_M"]
            size_M = float(raw) if raw is not None and np.isfinite(raw) else None
        family = row["family"]
        if family == "other":
            family = family_from_metadata(name, metadata) or "other"
        pt = {
            "modelName": name,
            "label": rec.get("label", name),
            "family": family,
            "variant": row["variant"],
            "datasetTag": row["dataset"],
            "x": round(float(xs_n[i]), 4),
            "y": round(float(ys_n[i]), 4),
        }
        if size_M is not None:
            pt["sizeM"] = float(size_M)
        if "num_params" in rec:
            pt["numParams"] = int(rec["num_params"])
        if slug:
            pt["slug"] = slug
        points.append(pt)

    points.sort(key=lambda p: (p["family"], p["modelName"]))

    out = {
        "dataset": dataset,
        "metric": "CKNNA distance (1 - sim) at k=25",
        "method": "UMAP (n_neighbors=10, min_dist=0.25, metric=precomputed, seed=0)",
        "n": len(points),
        "points": points,
    }

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUT_DIR / f"map-{dataset.lower()}.json"
    out_path.write_text(json.dumps(out, indent=2) + "\n")
    print(f"  ✓ {dataset}: {len(points)} points "
          f"({linked} linked to almanac slugs) → {out_path.relative_to(ALMANAC_ROOT)}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dataset", default="OMol25",
                    choices=[*DATASETS, "all"])
    args = ap.parse_args()

    targets = DATASETS if args.dataset == "all" else [args.dataset]
    slug_index = build_slug_index()
    metadata = load_metadata()

    print(f"slug index: {len(slug_index)} checkpoint ids across "
          f"{len({s for _, s in slug_index})} almanac models")

    for ds in targets:
        export_one(ds, slug_index, metadata)


if __name__ == "__main__":
    main()
