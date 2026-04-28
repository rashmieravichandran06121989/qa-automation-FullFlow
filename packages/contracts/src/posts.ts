import { z } from "zod";

/**
 * jsonplaceholder Post resource.
 *
 * Matches https://jsonplaceholder.typicode.com/posts/{id}. Anything Phase 1's
 * API tests or Phase 3's data factory consume from this endpoint must round-
 * trip through this schema, so a real drift fails fast (at parse) instead of
 * leaking into a flaky-looking assertion.
 */
export const PostSchema = z.object({
  userId: z.number().int().positive(),
  id:     z.number().int().positive(),
  title:  z.string().min(1),
  body:   z.string().min(1),
});

export type Post = z.infer<typeof PostSchema>;

/**
 * Payload shape for POST /posts. Server returns the created Post with a
 * synthetic `id` — we keep `id` optional on the input.
 */
export const PostInputSchema = PostSchema.omit({ id: true }).extend({
  id: z.number().int().positive().optional(),
});

export type PostInput = z.infer<typeof PostInputSchema>;
