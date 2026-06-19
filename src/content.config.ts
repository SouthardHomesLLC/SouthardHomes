//Import definition utilities from the standard v6/v7 content endpoint
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders'; 
import { z } from 'astro/zod';

//Define collection(s)
const blogCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }),
  schema: z.object({
    draft: z.boolean(),
    title: z.string(),
    snippet: z.string(),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    publishDate: z.string().transform(str => new Date(str)),
    author: z.string().default('Southard Homes LLC'),
    category: z.string(),
    tags: z.array(z.string()),
  }),
});

const teamCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/team" }),
  schema: z.object({
    draft: z.boolean(),
    name: z.string(),
    title: z.string(),
    avatar: z.object({
      src: z.string(), 
      alt: z.string(),
    }),
    publishDate: z.string().transform(str => new Date(str)),
  }),
});

//Export a single `collections` object to register collection(s)
export const collections = {
  'blog': blogCollection,
  'team': teamCollection,
};