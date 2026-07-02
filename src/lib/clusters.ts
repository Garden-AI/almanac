import { getCollection } from 'astro:content';

/** Clusters in display order: explicit `order` ascending (unset sorts last),
    then name. Shared by the matrix, model detail pages, and /clusters so
    column/section order can never disagree between pages. */
export async function getSortedClusters() {
  return (await getCollection('clusters')).sort((a, b) => {
    const oa = a.data.order ?? 999;
    const ob = b.data.order ?? 999;
    if (oa !== ob) return oa - ob;
    return a.data.name.localeCompare(b.data.name);
  });
}
