import z from "zod";

const envSchema = z.object({
  API_URL: z.string().optional().default("http://localhost:8000"),
});

export const env = envSchema.parse(process.env);
