import { Brand } from "@workspace/api-client"
import { zBrandWritable } from "@workspace/api-client/zod"
import z from "zod"

// The generated schema describes the API contract; the form adds its own UX
// rules on top (e.g. the API accepts an empty name, the form doesn't).
export const brandFormSchema = zBrandWritable
  .pick({ name: true })
  .extend({ name: z.string().trim().min(1, "Name is required").max(255) })

export type BrandFormValues = z.infer<typeof brandFormSchema>

export function toBrandFormValues(brand: Brand): BrandFormValues {
  return { name: brand.name }
}
