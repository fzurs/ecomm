import { ProductStatus } from "@workspace/api-client"
import { zProductStatus } from "@workspace/api-client/zod"
import { StatusDefinition, statusOptions } from "@/components/status"

// Keyed by the generated enum: a status added in the API fails the typecheck
// until it gets its label and color here.
export const productStatuses: Record<ProductStatus, StatusDefinition> = {
  draft: { label: "Draft", color: "blue" },
  active: { label: "Active", color: "green" },
  inactive: { label: "Inactive", color: "gray" },
  out_of_stock: { label: "Out of stock", color: "orange" },
  discontinued: { label: "Discontinued", color: "red" },
}

// In the API's order, for selects and filters.
export const productStatusOptions = statusOptions(
  zProductStatus.options,
  productStatuses
)
