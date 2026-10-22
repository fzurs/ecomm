import { Category } from "@workspace/api-client"
import { zCategoryWritable } from "@workspace/api-client/zod"
import z from "zod"

// The generated schema describes the API contract; the form adds its own UX
// rules on top (e.g. the API accepts an empty name, the form doesn't).
export const categoryFormSchema = zCategoryWritable
  .pick({ name: true, description: true })
  .extend({ name: z.string().trim().min(1, "Name is required").max(255) })

export type CategoryFormValues = z.infer<typeof categoryFormSchema>

export function toCategoryFormValues(category: Category): CategoryFormValues {
  return { name: category.name, description: category.description ?? "" }
}
