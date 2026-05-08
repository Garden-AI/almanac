#!/usr/bin/env node
// Walk src/content/papers/, find entries with source:'fetched' missing
// fields (title/authors/published/url), enrich them from Crossref then
// DataCite. Idempotent. `--force` re-fetches even when fields are present.
//
// Run: `npm run fetch:papers` (or `... -- --force`).

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const PAPERS_DIR = 'src/content/papers';
const USER_AGENT = "GardensAlmanac/0.1 (mailto:engler.will@gmail.com)";
const REQUEST_DELAY_MS = 250;

const force = process.argv.includes('--force');

type PaperJson = {
  doi?: string;
  title?: string;
  authors?: string[];
  published?: string;
  venue?: string;
  url?: string;
  citation?: string;
  source?: 'fetched' | 'manual';
};

type Result = 'fetched' | 'skipped-complete' | 'skipped-no-doi' | 'skipped-manual' | 'failed';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const isComplete = (p: PaperJson): boolean =>
  Boolean(p.title && p.authors?.length && p.published && p.url);

/** Pad partial date arrays to YYYY-MM-DD. [2026]→"2026-01-01"; [2026,3]→"2026-03-01"; [2026,3,5]→"2026-03-05". */
function padDate(parts: number[] | undefined | null): string | undefined {
  if (!parts || !parts.length) return undefined;
  const [y, m = 1, d = 1] = parts;
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

async function fetchCrossref(doi: string): Promise<Partial<PaperJson> | null> {
  const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/json' },
  });
  if (!res.ok) return null;
  const body = await res.json() as { message?: any };
  const m = body.message;
  if (!m) return null;
  const authors = Array.isArray(m.author)
    ? m.author.map((a: any) => {
        const family = a.family ?? '';
        const given = a.given ?? '';
        if (family && given) return `${family}, ${given}`;
        return family || given || '';
      }).filter(Boolean)
    : [];
  return {
    title: Array.isArray(m.title) ? m.title[0] : m.title,
    authors,
    published: padDate(m.issued?.['date-parts']?.[0]),
    venue: Array.isArray(m['container-title']) ? m['container-title'][0] : m['container-title'],
    url: m.URL,
  };
}

async function fetchDataCite(doi: string): Promise<Partial<PaperJson> | null> {
  // DataCite: GET /dois/{doi}. Body shape: { data: { attributes: { titles, creators, dates, publisher, url } } }
  const res = await fetch(`https://api.datacite.org/dois/${encodeURIComponent(doi)}`, {
    headers: { 'User-Agent': USER_AGENT, 'Accept': 'application/vnd.api+json' },
  });
  if (!res.ok) return null;
  const body = await res.json() as { data?: any };
  const a = body.data?.attributes;
  if (!a) return null;
  const authors = Array.isArray(a.creators)
    ? a.creators.map((c: any) => {
        if (c.familyName && c.givenName) return `${c.familyName}, ${c.givenName}`;
        return c.name ?? c.familyName ?? c.givenName ?? '';
      }).filter(Boolean)
    : [];
  // DataCite's "publication date" lives in dates[] with dateType=Issued, or
  // attributes.publicationYear as a fallback.
  let published: string | undefined;
  const issued = Array.isArray(a.dates) ? a.dates.find((d: any) => d.dateType === 'Issued') : null;
  if (issued?.date) {
    const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?/.exec(issued.date);
    if (m) {
      published = `${m[1]}-${m[2] ?? '01'}-${m[3] ?? '01'}`;
    }
  } else if (a.publicationYear) {
    published = `${a.publicationYear}-01-01`;
  }
  return {
    title: Array.isArray(a.titles) ? a.titles[0]?.title : undefined,
    authors,
    published,
    venue: a.publisher,
    url: a.url,
  };
}

async function enrichOne(slug: string, paper: PaperJson): Promise<{ paper: PaperJson; result: Result }> {
  if (paper.source !== 'fetched') return { paper, result: 'skipped-manual' };
  if (!force && isComplete(paper)) return { paper, result: 'skipped-complete' };
  if (!paper.doi) {
    console.warn(`  [warn] ${slug}: source=fetched but no doi — skipped`);
    return { paper, result: 'skipped-no-doi' };
  }

  let enriched: Partial<PaperJson> | null = null;
  try {
    enriched = await fetchCrossref(paper.doi);
  } catch (err) {
    console.warn(`  [warn] ${slug}: Crossref error — ${(err as Error).message}`);
  }
  if (!enriched || !enriched.title) {
    try {
      enriched = await fetchDataCite(paper.doi);
    } catch (err) {
      console.warn(`  [warn] ${slug}: DataCite error — ${(err as Error).message}`);
    }
  }
  if (!enriched || !enriched.title) {
    console.warn(`  [warn] ${slug}: not found in Crossref or DataCite for doi=${paper.doi}`);
    return { paper, result: 'failed' };
  }

  // Merge: enrichment fills missing/blank fields. With --force, enrichment overwrites.
  const merged: PaperJson = { ...paper };
  for (const k of ['title', 'authors', 'published', 'venue', 'url'] as const) {
    if (force || merged[k] == null || (Array.isArray(merged[k]) && (merged[k] as any[]).length === 0)) {
      const v = enriched[k];
      if (v != null && !(Array.isArray(v) && v.length === 0)) {
        (merged as any)[k] = v;
      }
    }
  }
  return { paper: merged, result: 'fetched' };
}

async function main() {
  let entries: string[];
  try {
    entries = await readdir(PAPERS_DIR);
  } catch {
    console.error(`No directory at ${PAPERS_DIR}`);
    process.exit(1);
  }
  const files = entries.filter((f) => f.endsWith('.json'));

  const counts: Record<Result, number> = {
    'fetched': 0, 'skipped-complete': 0, 'skipped-no-doi': 0, 'skipped-manual': 0, 'failed': 0,
  };

  for (const file of files) {
    const path = join(PAPERS_DIR, file);
    const slug = file.replace(/\.json$/, '');
    const raw = await readFile(path, 'utf8');
    let paper: PaperJson;
    try {
      paper = JSON.parse(raw);
    } catch {
      console.warn(`  [warn] ${slug}: invalid JSON — skipped`);
      counts.failed++;
      continue;
    }

    const before = JSON.stringify(paper);
    const { paper: next, result } = await enrichOne(slug, paper);
    counts[result]++;

    if (result === 'fetched' && JSON.stringify(next) !== before) {
      await writeFile(path, JSON.stringify(next, null, 2) + '\n');
      console.log(`  [fetched] ${slug} ← ${next.title?.slice(0, 60)}${(next.title?.length ?? 0) > 60 ? '…' : ''}`);
    } else if (result === 'skipped-complete') {
      console.log(`  [skip] ${slug}: already complete`);
    }

    if (result === 'fetched') await sleep(REQUEST_DELAY_MS);
  }

  console.log('');
  console.log(`Summary:`);
  console.log(`  fetched          ${counts.fetched}`);
  console.log(`  skipped-complete ${counts['skipped-complete']}`);
  console.log(`  skipped-manual   ${counts['skipped-manual']}`);
  console.log(`  skipped-no-doi   ${counts['skipped-no-doi']}`);
  console.log(`  failed           ${counts.failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
