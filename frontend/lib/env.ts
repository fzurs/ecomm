import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().optional(),
  NEXT_PUBLIC_USE_MOCK: z
    .union([z.literal("true"), z.literal("false")])
    .default("true"),
});

const env = envSchema.parse(process.env);

export default env;
