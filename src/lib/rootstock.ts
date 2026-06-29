/**
 * Typed client for the Rootstock admin-dashboard bulk-dump endpoint.
 *
 * Fetching is async (network or fixture); everything downstream is a pure
 * function of the dump. That split lets the same derivations run at build
 * time (Astro frontmatter) and on the client (live refresh) without
 * duplicating logic.
 */

import fixture from '../fixtures/rootstock-dump.json' with { type: 'json' };

export type RootstockStatus = 'ready' | string;

export interface RootstockCheckpoint {
  fetched_at: string | null;
  verified_at: string | null;
  verified_device: string | null;
  last_error: string | null;
}

export interface RootstockEnvironment {
  status: RootstockStatus;
  built_at: string | null;
  source_hash: string;
  source: string;
  python_requires: string;
  dependencies: Record<string, string>;
  /** Map of canonical checkpoint identifier → verification record. */
  checkpoints: Record<string, RootstockCheckpoint>;
}

export interface RootstockManifest {
  schema_version: string | number;
  cluster: string;
  root: string;
  maintainer: { name: string; email: string };
  rootstock_version: string;
  python_version: string;
  last_updated: string;
  environments: Record<string, RootstockEnvironment>;
}

export interface RootstockDump {
  manifests: RootstockManifest[];
}

export const ROOTSTOCK_URL = import.meta.env.PUBLIC_ROOTSTOCK_URL;

export async function getRootstockDump(): Promise<RootstockDump> {
  if (ROOTSTOCK_URL) {
    // The live fetch is best-effort: if Rootstock is unreachable (offline
    // build, backend down), fall back to the captured fixture rather than
    // crashing the page render. The client-side refresh corrects statuses
    // once the network is back; until then the baked catalog still renders.
    try {
      const res = await fetch(ROOTSTOCK_URL);
      if (!res.ok) throw new Error(`Rootstock fetch failed: ${res.status}`);
      return (await res.json()) as RootstockDump;
    } catch (err) {
      console.warn('Rootstock dump unavailable, using fixture seed:', err);
      return fixture as RootstockDump;
    }
  }
  return fixture as RootstockDump;
}

export function findManifest(
  dump: RootstockDump,
  clusterSlug: string,
): RootstockManifest | null {
  return dump.manifests.find((m) => m.cluster === clusterSlug) ?? null;
}

export interface CheckpointVerification {
  /** Env (manifest key) the checkpoint was verified through. */
  env: string;
  verifiedAt: string | null;
  verifiedDevice: string | null;
  lastError: string | null;
}

/** Compatibility-matrix lookup. Returns the latest verification for a
    `(cluster, checkpoint)` pair across all envs on that cluster, or null
    if the cluster's manifest doesn't list that checkpoint anywhere
    (= "n/a" / hatched in the matrix). */
export function findVerification(
  dump: RootstockDump,
  clusterSlug: string,
  checkpointId: string,
): CheckpointVerification | null {
  const manifest = findManifest(dump, clusterSlug);
  if (!manifest) return null;
  for (const [envName, env] of Object.entries(manifest.environments)) {
    const cp = env.checkpoints?.[checkpointId];
    if (cp) {
      return {
        env: envName,
        verifiedAt: cp.verified_at,
        verifiedDevice: cp.verified_device,
        lastError: cp.last_error,
      };
    }
  }
  return null;
}

export type CellState = 'verified' | 'lapsed' | 'na';

const STALE_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

export function cellStateFor(
  v: CheckpointVerification | null,
  now: number = Date.now(),
): CellState {
  if (!v) return 'na';
  if (v.lastError) return 'lapsed';
  if (!v.verifiedAt) return 'lapsed';
  const age = now - new Date(v.verifiedAt).getTime();
  if (Number.isNaN(age) || age > STALE_AFTER_MS) return 'lapsed';
  return 'verified';
}

/**
 * Status-mark SVG for one compatibility-matrix cell. Shared verbatim by the
 * build-time render (Astro frontmatter) and the client live-refresh script so
 * the two can never drift — they import THIS function, not a hand-copied twin.
 *
 * `dim` (fully-unsupported rows) softens the n/a hatch. The n/a SVG fills its
 * cell via `position:absolute` (the `.am-cell` is `position:relative`), so the
 * hatch covers the whole cell rather than a short band; `var(--*)` tokens
 * resolve against the page CSS in both render paths.
 */
export function cellSvg(state: CellState, dim = false): string {
  const stroke = dim ? '#a67878' : 'var(--oxblood)';
  if (state === 'verified') {
    return `<svg width="14" height="14" viewBox="0 0 14 14" aria-label="verified"><circle cx="7" cy="7" r="3.6" fill="${stroke}" /></svg>`;
  }
  if (state === 'lapsed') {
    return `<svg width="14" height="14" viewBox="0 0 14 14" aria-label="lapsed"><circle cx="7" cy="7" r="3.4" fill="none" stroke="${stroke}" stroke-width="1" /></svg>`;
  }
  const id = dim ? 'am-hatch-d' : 'am-hatch-n';
  const op = dim ? 0.28 : 0.45;
  return `<svg aria-label="not applicable" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block;"><defs><pattern id="${id}" patternUnits="userSpaceOnUse" width="7" height="7" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="var(--ink)" stroke-width="0.9" opacity="${op}" /></pattern></defs><rect x="0" y="0" width="100%" height="100%" fill="url(#${id})" /></svg>`;
}

export interface ClusterEnvGroup {
  envName: string;
  status: string;
  builtAt: string | null;
  checkpoints: Array<{
    id: string;
    verifiedAt: string | null;
    verifiedDevice: string | null;
    lastError: string | null;
  }>;
}

/* ─────────────────────────────────────────────────────────────────────────
 * Model-detail "Environments" section: the verbatim env file Rootstock
 * installs for a model, per installed cluster. All of the following is shared
 * by the build-time seed render and the client live-refresh so the two render
 * byte-identically (same rule as `cellSvg`).
 * ──────────────────────────────────────────────────────────────────────── */

export interface ModelEnvFile {
  /** Cluster slug. */
  cluster: string;
  /** Cluster display name (tab label). */
  clusterName: string;
  /** Manifest env key the model's checkpoints live in. */
  env: string;
  /** Basename shown in the listing chrome (never the on-cluster path). */
  filename: string;
  /** Verbatim env `.py` source, shown unmodified (provenance). */
  source: string;
  builtAt: string | null;
}

/** Stable per-family basename: terse and verbose variants of one family env
 *  collapse to the same name (`mace` & `mace_env` → `mace_env.py`). */
export function envFileName(env: string): string {
  const base = env.endsWith('_env') ? env : `${env}_env`;
  return `${base}.py`;
}

/** Env files for the model-detail Environments tabs: one per *installed*
 *  cluster, in the given cluster order, sourced from whichever env carries the
 *  model's checkpoints on that cluster (first match — they share one env in
 *  practice). Clusters with no installed checkpoint produce no entry (no tab),
 *  so the tab set is derived from install status, never a hardcoded list. */
export function envFilesForModel(
  dump: RootstockDump,
  clusters: Array<{ id: string; name: string }>,
  checkpointIds: string[],
): ModelEnvFile[] {
  const files: ModelEnvFile[] = [];
  for (const c of clusters) {
    const manifest = findManifest(dump, c.id);
    if (!manifest) continue;
    let env: string | null = null;
    for (const cp of checkpointIds) {
      const v = findVerification(dump, c.id, cp);
      if (v) {
        env = v.env;
        break;
      }
    }
    if (!env) continue;
    const e = manifest.environments[env];
    if (!e) continue;
    files.push({
      cluster: c.id,
      clusterName: c.name,
      env,
      filename: envFileName(env),
      source: e.source ?? '',
      builtAt: e.built_at,
    });
  }
  return files;
}

function escEnv(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const ENV_KEYWORDS = new Set(
  ('def return from import if elif else for while in is not and or None True ' +
    'False class with as try except finally raise lambda yield pass break ' +
    'continue global nonlocal assert del str int float bool list dict set tuple')
    .split(' '),
);

/**
 * One line of Python → HTML, paper-palette syntax theme: keywords sienna,
 * strings olive, numbers teal, comments grey. Oxblood is never used here (it's
 * reserved for links/status). Quoted substrings inside a comment keep the
 * string color, so version pins in the PEP-723 `# /// script` block read at
 * full contrast — the values a user comes to check.
 */
function highlightEnvLine(ln: string): string {
  const span = (v: string, t: string) => `<span style="color:var(${v})">${t}</span>`;
  let out = '';
  let i = 0;
  const n = ln.length;
  while (i < n) {
    const ch = ln[i];
    if (ch === '"' || ch === "'") {
      const q = ch;
      let j = i + 1;
      while (j < n && ln[j] !== q) {
        if (ln[j] === '\\') j++;
        j++;
      }
      out += span('--syn-str', escEnv(ln.slice(i, Math.min(j + 1, n))));
      i = j + 1;
      continue;
    }
    if (ch === '#') {
      const rest = ln.slice(i);
      let k = 0;
      while (k < rest.length) {
        const c2 = rest[k];
        if (c2 === '"' || c2 === "'") {
          let m = k + 1;
          while (m < rest.length && rest[m] !== c2) m++;
          out += span('--syn-str', escEnv(rest.slice(k, Math.min(m + 1, rest.length))));
          k = m + 1;
          continue;
        }
        let m = k;
        while (m < rest.length && rest[m] !== '"' && rest[m] !== "'") m++;
        out += span('--syn-com', escEnv(rest.slice(k, m)));
        k = m;
      }
      break;
    }
    if (/[A-Za-z_]/.test(ch)) {
      let j = i;
      while (j < n && /[A-Za-z0-9_]/.test(ln[j])) j++;
      const w = ln.slice(i, j);
      out += ENV_KEYWORDS.has(w) ? span('--syn-kw', escEnv(w)) : escEnv(w);
      i = j;
      continue;
    }
    if (/[0-9]/.test(ch)) {
      let j = i;
      while (j < n && /[0-9.]/.test(ln[j])) j++;
      out += span('--syn-num', escEnv(ln.slice(i, j)));
      i = j;
      continue;
    }
    out += escEnv(ch);
    i++;
  }
  return out;
}

/**
 * Full inner HTML of the code body: one numbered row per line, with a
 * line-number gutter and docstring-aware coloring (triple-quoted blocks render
 * entirely in the comment color). Rendered verbatim — no reformatting. Shared
 * by the build seed and the client tab-switch so the two never drift.
 */
export function renderEnvBody(source: string): string {
  const lines = source.split('\n');
  let inDoc = false;
  const rows = lines.map((ln, i) => {
    const has3 = ln.includes('"""');
    let html: string;
    if (inDoc) {
      html = `<span style="color:var(--syn-com)">${escEnv(ln)}</span>`;
      if (has3) inDoc = false;
    } else if (has3) {
      const count = (ln.match(/"""/g) || []).length;
      if (count % 2 === 1) inDoc = true;
      html = `<span style="color:var(--syn-com)">${escEnv(ln)}</span>`;
    } else {
      html = highlightEnvLine(ln) || '&#8203;';
    }
    return (
      '<div class="am-env-line">' +
      `<span class="am-env-gutter">${i + 1}</span>` +
      `<span class="am-env-code">${html}</span>` +
      '</div>'
    );
  });
  return `<div class="am-env-rows">${rows.join('')}</div>`;
}

/** Env-grouped checkpoint listing for a single cluster (cluster page). */
export function envGroupsForCluster(
  dump: RootstockDump,
  clusterSlug: string,
): ClusterEnvGroup[] {
  const manifest = findManifest(dump, clusterSlug);
  if (!manifest) return [];
  return Object.entries(manifest.environments)
    .map(([envName, env]) => ({
      envName,
      status: env.status,
      builtAt: env.built_at,
      checkpoints: Object.entries(env.checkpoints ?? {})
        .map(([id, cp]) => ({
          id,
          verifiedAt: cp.verified_at,
          verifiedDevice: cp.verified_device,
          lastError: cp.last_error,
        }))
        .sort((a, b) => a.id.localeCompare(b.id)),
    }))
    .filter((g) => g.checkpoints.length > 0)
    .sort((a, b) => a.envName.localeCompare(b.envName));
}
