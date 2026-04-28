import { z } from "zod";

/**
 * jsonplaceholder User resource. Trimmed to the fields the portfolio actually
 * relies on; the upstream returns more, but anything we don't validate we
 * shouldn't depend on.
 */
export const UserAddressSchema = z.object({
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
