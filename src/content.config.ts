import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const FAMILY_KEY = z.enum(['equivariant', 'ace', 'message-passing', 'vanilla', 'earlier']);

const architectures = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/architectures' }),
  schema: z.object({
    name: z.string(),
    descriptor: z.string(),
    body: z.string(),
  }),
});

const datasets = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/datasets' }),
  schema: z.object({
    name: z.string(),
    fullName: z.string(),
    domain: z.enum(['molecules', 'materials', 'catalysis', 'mixed']),
    curator: z.string(),
    year: z.number().int(),
    size: z.string(),
    dftLevel: z.string(),
    license: z.string(),
    doi: z.string().url().optional(),
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
          weightsBytes: z.number().int().optional(),
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
    /** Short label (e.g. "ALCF") used in the compatibility-matrix column header. */
    institutionShort: z.string().optional(),
    /** Short GPU label (e.g. "NVIDIA A100") used in the matrix header. */
    gpu: z.string().optional(),
    /** Display order in the compatibility matrix, ascending. */
    order: z.number().int().optional(),
    subtitle: z.string().optional(),
    specs: z.record(z.string(), z.string()),
    runningOn: z.string().optional(),
    notes: z.string().optional(),
  }),
});

/**
 * Pre-computed UMAP layouts of CKNNA distances, exported from
 * `almanac_embeddings/export_layouts.py`. One file per reference dataset.
 * Points may or may not link to an almanac model — many of the models in
 * the embedding study (LLMs, off-domain controls) aren't catalogued here.
 */
const embeddings = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/embeddings' }),
  schema: z.object({
    dataset: z.string(),
    metric: z.string(),
    method: z.string(),
    n: z.number().int(),
    points: z.array(
      z.object({
        modelName: z.string(),
        label: z.string(),
        family: z.string(),
        variant: z.string().optional(),
        datasetTag: z.string().optional(),
        sizeM: z.number().optional(),
        numParams: z.number().int().optional(),
        x: z.number(),
        y: z.number(),
        slug: reference('models').optional(),
      }),
    ),
  }),
});

export const collections = { architectures, datasets, models, clusters, papers, embeddings };
export { FAMILY_KEY };
