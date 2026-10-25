import { ProductStatus } from "@workspace/api-client"
import { Badge } from "@workspace/ui/components/badge"
import { productStatuses } from "../_lib/product-status"

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const { label, icon } = productStatuses[status]
  return (
    <Badge variant="outline">
      {icon} {label}
    </Badge>
  )
}
