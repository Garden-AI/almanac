/**
 * Browser-side loader for the Rootstock dump. Memoized so multiple
 * islands on the same page (or even the prefetch warm-up) share one
 * fetch.
 */

import type { RootstockDump } from './rootstock';

const URL_ = import.meta.env.PUBLIC_ROOTSTOCK_URL as string | undefined;

let inflight: Promise<RootstockDump> | null = null;

export function loadLiveDump(): Promise<RootstockDump> {
  if (!URL_) return Promise.reject(new Error('PUBLIC_ROOTSTOCK_URL not set'));
  if (!inflight) {
    inflight = fetch(URL_)
      .then((res) => {
        if (!res.ok) throw new Error(`Rootstock fetch failed: ${res.status}`);
        return res.json() as Promise<RootstockDump>;
      })
      .catch((err) => {
        inflight = null;
        throw err;
      });
  }
  return inflight;
}
