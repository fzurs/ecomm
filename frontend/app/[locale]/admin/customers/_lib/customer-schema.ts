import * as z from "zod";

export const customerSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.email(),
  age: z.number(),
  gender: z.string(),
});

export type Customer = z.infer<typeof customerSchema>;
