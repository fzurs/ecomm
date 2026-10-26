import { ProductStatus } from "@workspace/api-client"
import { StatusBadge } from "@/components/status"
import { productStatuses } from "../_lib/product-status"

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return <StatusBadge {...productStatuses[status]} />
}
