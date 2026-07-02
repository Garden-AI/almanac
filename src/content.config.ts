import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const architectures = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/architectures' }),
  schema: z.object({
    name: z.string(),
    /** Summary shown on the Models page family card. */
    brief: z.string(),
    /** Representative paper for the family, shown on the Models page card. */
    examplePaper: reference('papers').optional(),
    /** Display label for the example paper (e.g. "Liao et al., EquiformerV2 (2023)"). */
    examplePaperLabel: z.string().optional(),
  }),
});

const datasets = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/datasets' }),
  schema: z.object({
    name: z.string(),
    fullName: z.string(),
    domain: z.enum(['molecules', 'materials', 'catalysis', 'mixed']),
    /** What the structures are (e.g. "molecules", "inorganic crystals",
     *  "surfaces/interfaces"). Free text from the verification sheet —
     *  finer-grained than `domain`, which it will eventually replace. */
    systemType: z.string().optional(),
    /** Intended use ("general", "catalysis", "biomolecular", …). */
    application: z.string().optional(),
    /** One or two sentences on why people care about this dataset,
     *  shown on the Datasets page card (mirrors architectures.brief). */
    brief: z.string().optional(),
    /** Which labels each structure carries, as sheet shorthand:
     *  E energy, F forces, S stress, Q charges, M magnetic moments. */
    labels: z.string().optional(),
    /** Element coverage, free text ("C, H, N, O" or "most of the periodic table"). */
    elements: z.string().optional(),
    curator: z.string(),
    year: z.number().int(),
    size: z.string(),
    dftLevel: z.string(),
    license: z.string(),
    /** Canonical link — a DOI when one exists, else the dataset's host page. */
    doi: z.string().url().optional(),
    /** Title of the canonical paper, used to compose the citation line. */
    paperTitle: z.string().optional(),
    /** Author surnames of the canonical paper, in paper order. */
    authors: z.array(z.string()).default([]),
    primaryPaper: z.string().optional(),
    notes: z.string().optional(),
    howToGet: z.string().optional(),
  }),
});

const models = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/models' }),
  schema: z.object({
    name: z.string(),
    families: z.array(reference('architectures')).min(1),
    /** Optional override. If absent, the catalog sort and "Released" line
     *  use the primary paper's `published` date. Set this when the model
     *  release predates the paper or no paper exists. ISO YYYY-MM-DD. */
    releaseDate: z.string().optional(),

    paperRefs: z.array(reference('papers')).default([]),
    codeUrl: z.string().url().optional(),
    huggingFaceId: z.string().optional(),
    weightsUrl: z.string().url().optional(),

    cachePath: z.string().optional(),

    checkpoints: z
      .array(
        z.object({
          id: z.string(),
          params: z.string().optional(),
        }),
      )
      .min(1),

    /** Plain list of dataset references — order follows the data. */
    trainingData: z.array(reference('datasets')).default([]),

    /** Markdown. Free-text gotchas, operator caveats, deprecation/scope
     *  notes. NOT for performance commentary or "when to use"
     *  recommendations — those belong to the paper / model card. */
    notes: z.string().optional(),
  }),
});

const papers = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/papers' }),
  schema: z.object({
    doi: z.string().optional(),
    title: z.string().optional(),
    authors: z.array(z.string()).default([]),
    /** ISO date. Pad to first-of-month / first-of-year when finer
     *  granularity is unknown. Used for catalog reverse-chron sort. */
    published: z.string().optional(),
    venue: z.string().optional(),
    url: z.string().url().optional(),
    citation: z.string().optional(),
    /** Distinguishes fetch-script output from hand-written entries.
     *  Fetched entries can be overwritten by re-running the fetcher;
     *  manual ones never are. */
    source: z.enum(['fetched', 'manual']).default('manual'),
  }),
});

const clusters = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/clusters' }),
  schema: z.object({
    /** Slug must match `manifests[].cluster` from the Rootstock dump. */
    name: z.string(),
    institution: z.string(),
    /** Short label (e.g. "ALCF") used in the matrix column header. */
    institutionShort: z.string().optional(),
    /** GPU the cluster's MLIPs are tested on (e.g. "NVIDIA A100 40GB").
     *  Shown in the matrix header and as "Tested on" on /clusters. */
    gpu: z.string().optional(),
    /** Display order in the matrix + /clusters list, ascending. */
    order: z.number().int().optional(),
    /** Official cluster docs URL (the "Cluster docs ↗" link on /clusters). */
    documentation: z.string().url().optional(),
    /** Short "Heads up" notes for the /clusters page. Usually empty. */
    gotchas: z.array(z.string()).optional(),
  }),
});

export const collections = { architectures, datasets, models, clusters, papers };
