/**
 * Typed client for the Rootstock admin-dashboard bulk-dump endpoint.
 *
 * Today this reads from a captured fixture so the build is offline-clean.
 * To switch to live data, set ROOTSTOCK_URL in .env and the loader will
 * fetch instead. Response shape matches manifest schema v3 (per-checkpoint
 * verification, env keys without the `_env` suffix).
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

const ROOTSTOCK_URL = import.meta.env.ROOTSTOCK_URL;

export async function getRootstockDump(): Promise<RootstockDump> {
  if (ROOTSTOCK_URL) {
    const res = await fetch(ROOTSTOCK_URL);
    if (!res.ok) throw new Error(`Rootstock fetch failed: ${res.status}`);
    return res.json() as Promise<RootstockDump>;
  }
  return fixture as RootstockDump;
}

export async function getClusterManifest(
  clusterSlug: string,
): Promise<RootstockManifest | null> {
  const dump = await getRootstockDump();
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
export async function getCheckpointVerification(
  clusterSlug: string,
  checkpointId: string,
): Promise<CheckpointVerification | null> {
  const manifest = await getClusterManifest(clusterSlug);
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
