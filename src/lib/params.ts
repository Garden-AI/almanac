/** Helpers for displaying parameter counts that now live on per-checkpoint
    entries rather than at the model level. */

export interface CheckpointLike {
  id: string;
  params?: string;
}

const num = (p: string): number => {
  const n = parseFloat(p);
  if (Number.isNaN(n)) return -1;
  return p.endsWith('B') ? n * 1000 : n;
};

/** Largest known checkpoint params for a model, e.g. "15.6M" or undefined. */
export function largestParams(checkpoints: CheckpointLike[]): string | undefined {
  let bestStr: string | undefined;
  let bestN = -1;
  for (const cp of checkpoints) {
    if (!cp.params) continue;
    const n = num(cp.params);
    if (n > bestN) {
      bestN = n;
      bestStr = cp.params;
    }
  }
  return bestStr;
}

/** Compact display string for a model's size. Single checkpoint with params
    → that string. Multiple checkpoints with params → "min–max". Otherwise
    "—". */
export function displayParams(checkpoints: CheckpointLike[]): string {
  const known = checkpoints.filter((cp) => cp.params).map((cp) => cp.params!);
  if (known.length === 0) return '—';
  if (known.length === 1) return known[0];
  let minStr = known[0];
  let maxStr = known[0];
  let minN = num(known[0]);
  let maxN = minN;
  for (const p of known.slice(1)) {
    const n = num(p);
    if (n < minN) {
      minN = n;
      minStr = p;
    }
    if (n > maxN) {
      maxN = n;
      maxStr = p;
    }
  }
  return minStr === maxStr ? minStr : `${minStr}–${maxStr}`;
}

/** Numeric size for plotting. Returns 0 if no checkpoint has known params. */
export function paramsForSize(checkpoints: CheckpointLike[]): number {
  const big = largestParams(checkpoints);
  return big ? num(big) : 0;
}
