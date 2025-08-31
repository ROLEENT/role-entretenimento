import { z } from "zod";

export const postSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3, "Título deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres"),
  status: z.enum(["draft", "published"]).default("draft"),
  category_id: z.number().optional().nullable(),
  tags: z.array(z.number()).default([]),
  author_id: z.string().uuid(),
  excerpt: z.string().optional().nullable(),
  content: z.string().optional().nullable(), // HTML/Markdown
  cover_url: z.string().url().optional().nullable(),
  seo_title: z.string().optional().nullable(),
  seo_description: z.string().optional().nullable(),
});

export type PostForm = z.infer<typeof postSchema>;