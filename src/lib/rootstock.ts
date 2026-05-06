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
  fetched_at: string;
  verified_at: string;
  verified_device: string;
  last_error: string | null;
}

export interface RootstockEnvironment {
  status: RootstockStatus;
  built_at: string;
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
    const res = await fetch(ROOTSTOCK_URL);
    if (!res.ok) throw new Error(`Rootstock fetch failed: ${res.status}`);
    return res.json() as Promise<RootstockDump>;
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
  verifiedAt: string;
  verifiedDevice: string;
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

const STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

export function cellStateFor(
  v: CheckpointVerification | null,
  now: number = Date.now(),
): CellState {
  if (!v) return 'na';
  if (v.lastError) return 'lapsed';
  const age = now - new Date(v.verifiedAt).getTime();
  if (Number.isNaN(age) || age > STALE_AFTER_MS) return 'lapsed';
  return 'verified';
}

export interface ClusterEnvGroup {
  envName: string;
  status: string;
  builtAt: string;
  checkpoints: Array<{
    id: string;
    verifiedAt: string;
    verifiedDevice: string;
    lastError: string | null;
  }>;
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
