import { Product } from "@workspace/api-client"
import { zProductWritable } from "@workspace/api-client/zod"
import z from "zod"

// The generated schema describes the API contract; the form adds its own UX
// rules on top (e.g. the API accepts an empty name, the form doesn't).
export const productFormSchema = zProductWritable
  .pick({
    sku: true,
    name: true,
    description: true,
    category_id: true,
    brand_id: true,
    status: true,
    featured: true,
    price: true,
    discount_percent: true,
    vat_rate: true,
  })
  .extend({ name: z.string().trim().min(1, "Name is required").max(255) })

export type ProductFormValues = z.infer<typeof productFormSchema>

// Preview only, while editing: mirrors `Product.active_price` in the API
// (rounded half up), which stays the source of truth once saved.
export function previewActivePrice(
  price: number | null | undefined,
  discountPercent: number | null | undefined
) {
  if (!price || !discountPercent) return null
  return Math.floor((price * (100 - discountPercent) + 50) / 100)
}

export function toProductFormValues(product: Product): ProductFormValues {
  return {
    sku: product.sku ?? "",
    name: product.name,
    description: product.description ?? "",
    category_id: product.category_id ?? product.category?.id ?? null,
    brand_id: product.brand_id ?? product.brand?.id ?? null,
    status: product.status,
    featured: product.featured ?? false,
    price: product.price ?? null,
    discount_percent: product.discount_percent ?? null,
    vat_rate: product.vat_rate ?? 5,
  }
}
