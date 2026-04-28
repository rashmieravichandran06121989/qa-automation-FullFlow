/**
 * Zod schemas for the upstream APIs Phase 1 hits (jsonplaceholder).
 *
 * Mirror of `packages/contracts/` — duplicated in-phase so the suite runs
 * without bootstrapping the pnpm workspace. When the workspace is wired up,
 * replace these imports with `import { PostSchema, UserSchema } from
 * "@qa-architect/contracts";` and delete this file. ADR-0004 explains the
 * rationale.
 *
 * Closes the audit gap "schema validation (Zod/Ajv) — Days 11-12 missing".
 */

import { z } from "zod";

// ---- Posts ----------------------------------------------------------------

export const PostSchema = z.object({
  userId: z.number().int().positive(),
  id:     z.number().int().positive(),
  title:  z.string().min(1),
  body:   z.string().min(1),
});
export type Post = z.infer<typeof PostSchema>;

export const PostInputSchema = PostSchema.omit({ id: true }).extend({
  id: z.number().int().positive().optional(),
});
export type PostInput = z.infer<typeof PostInputSchema>;

// ---- Users ----------------------------------------------------------------

const UserAddressSchema = z.object({
  street:  z.string(),
  suite:   z.string(),
  city:    z.string(),
  zipcode: z.string(),
  geo: z.object({
    lat: z.string(),
    lng: z.string(),
  }),
});

export const UserSchema = z.object({
  id:       z.number().int().positive(),
  name:     z.string().min(1),
  username: z.string().min(1),
  email:    z.string().email(),
  phone:    z.string(),
  website:  z.string(),
  address:  UserAddressSchema,
});
export type User = z.infer<typeof UserSchema>;

export const UserListSchema = z.array(UserSchema).min(1);
