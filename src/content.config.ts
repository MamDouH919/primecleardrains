import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: z.optional(image()),
		}),
});

// معرض الأعمال: كل مشروع ملف في src/content/projects وصوره في src/assets/projects
const projects = defineCollection({
	loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			date: z.coerce.date(),
			service: z.string(),
			area: z.string(),
			cover: image(),
			coverAlt: z.string(),
			// قبل وبعد: لو الصورتين موجودين بيظهر سلايدر المقارنة
			before: image().optional(),
			after: image().optional(),
			photos: z.array(z.object({ image: image(), alt: z.string() })).default([]),
			featured: z.boolean().default(false),
		}),
});

export const collections = { blog, projects };
