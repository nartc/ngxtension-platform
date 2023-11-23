import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';
import { defineCollection, reference, z } from 'astro:content';

const contributors = defineCollection({
	type: 'data',
	schema: z.object({
		name: z.string(),
		twitter: z.string().url().optional(),
		linkedin: z.string().url().optional(),
		github: z.string().url().optional(),
	}),
});

const docs = defineCollection({
	schema: (ctx) =>
		docsSchema()(ctx).extend({
			badge: z.enum(['stable', 'unstable', 'experimental']).optional(),
			contributor: reference('contributors').optional(),
		}),
});

const i18n = defineCollection({ type: 'data', schema: i18nSchema() });

export const collections = {
	docs: docs,
	i18n: i18n,
	contributors: contributors,
};
