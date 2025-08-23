import * as z from "zod";

export const productSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  price: z.number(),
  rating: z.number(),
  stock: z.number(),
  meta: z.object({
    createdAt: z.string().transform((str) => new Date(str)),
    updatedAt: z.string().transform((str) => new Date(str)),
  }),
  reviews: z.array(z.object()),
});

export type Product = z.infer<typeof productSchema>;

export const categorySchema = z.object({ name: z.string(), slug: z.string() });

export type Category = z.infer<typeof categorySchema>;
