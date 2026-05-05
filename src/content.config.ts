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
    family: reference('architectures'),
    year: z.number().int().optional(),
    leadAuthor: z.string().optional(),
    /** Canonical checkpoint identifiers for this model page. The matrix has
        one row per entry; cluster manifests verify by these same ids. */
    checkpoints: z
      .array(
        z.object({
          id: z.string(),
          params: z.string().optional(),
        }),
      )
      .min(1),
    trainingData: z
      .array(
        z.object({
          dataset: reference('datasets'),
          role: z.enum([
            'Training data',
            'Pretraining',
            'Fine-tuning',
            'Sole training data',
            'Joint training',
            'Auxiliary',
          ]),
        }),
      )
      .default([]),
    notes: z.string().optional(),
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

export const collections = { architectures, datasets, models, clusters };
export { FAMILY_KEY };
