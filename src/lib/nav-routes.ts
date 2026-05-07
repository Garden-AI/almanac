import { getCollection } from 'astro:content';
import { url } from './url';

export type NavRoute = {
  href: string;
  section: string;
  sectionTitle?: string;
  title: string;
  note?: string;
  indent?: boolean;
};

export async function getNavRoutes(): Promise<NavRoute[]> {
  const [models, clusters, datasets, architectures] = await Promise.all([
    getCollection('models'),
    getCollection('clusters'),
    getCollection('datasets'),
    getCollection('architectures'),
  ]);

  const byName = <T extends { data: { name: string } }>(a: T, b: T) =>
    a.data.name.localeCompare(b.data.name);
  const modelsSorted = [...models].sort(byName);
  const clustersSorted = [...clusters].sort(
    (a, b) => (a.data.order ?? 999) - (b.data.order ?? 999) || byName(a, b),
  );
  const datasetsSorted = [...datasets].sort(byName);
  const archSorted = [...architectures].sort(byName);

  return [
    { href: url('/'), section: 'i', sectionTitle: 'Frontispiece', title: 'Cover' },
    { href: url('/about'), section: '01', sectionTitle: 'About this Almanac', title: 'About this Almanac' },
    { href: url('/map'), section: '02', sectionTitle: 'The Map', title: 'The Map' },
    { href: url('/catalog'), section: '03', sectionTitle: 'Model Catalog', title: 'Index', note: `${models.length} entries` },
    ...modelsSorted.map((m): NavRoute => ({
      href: url(`/model/${m.id}`),
      section: '03',
      title: m.data.name,
      indent: true,
    })),
    { href: url('/compatibility'), section: '04', sectionTitle: 'Where to Run on HPC', title: 'Compatibility Matrix' },
    ...clustersSorted.map((c): NavRoute => ({
      href: url(`/cluster/${c.id}`),
      section: '04',
      title: c.data.name,
      indent: true,
    })),
    { href: url('/datasets'), section: '05', sectionTitle: 'Datasets', title: 'Index' },
    ...datasetsSorted.map((d): NavRoute => ({
      href: url(`/dataset/${d.id}`),
      section: '05',
      title: d.data.name,
      indent: true,
    })),
    { href: url('/architectures'), section: '06', sectionTitle: 'Architectures', title: 'Index' },
    ...archSorted.map((a): NavRoute => ({
      href: url(`/architecture/${a.id}`),
      section: '06',
      title: a.data.name,
      indent: true,
    })),
  ];
}
