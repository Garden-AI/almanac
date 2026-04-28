/**
 * Typed client for the Rootstock admin-dashboard bulk-dump endpoint.
 *
 * Today this reads from a captured fixture so the build is offline-clean.
 * To switch to live data, set ROOTSTOCK_URL in .env and the loader will
 * fetch instead. Response shape matches the live endpoint as of 2026-04.
 */

import fixture from '../fixtures/rootstock-dump.json' with { type: 'json' };

export type RootstockStatus = 'ready' | string;

export interface RootstockEnvironment {
  status: RootstockStatus;
  built_at: string;
  source_hash: string;
  source: string;
  python_requires: string;
  dependencies: Record<string, string>;
  checkpoints: unknown[];
}

export interface RootstockManifest {
  schema_version: string;
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

/** Compatibility-matrix lookup. Returns the env's status, or null if the
    cluster doesn't carry that environment (= "n/a" in matrix terms). */
export async function getEnvStatusOnCluster(
  clusterSlug: string,
  envName: string,
): Promise<{ status: RootstockStatus; builtAt: string } | null> {
  const manifest = await getClusterManifest(clusterSlug);
  const env = manifest?.environments[envName];
  if (!env) return null;
  return { status: env.status, builtAt: env.built_at };
}
