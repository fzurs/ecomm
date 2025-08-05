import z from "zod";

export const ProductSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  status: z.string(),
  price: z.string(),
  quantity: z.number(),
  last_update: z.date(),
  image: z.string().optional(),
});

export type Product = z.infer<typeof ProductSchema>;
