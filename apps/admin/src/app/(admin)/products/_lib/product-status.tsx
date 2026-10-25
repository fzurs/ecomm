import {
  ArchiveXIcon,
  CircleCheckIcon,
  CircleXIcon,
  LoaderIcon,
  PackageXIcon,
} from "lucide-react"
import { ProductStatus } from "@workspace/api-client"
import { zProductStatus } from "@workspace/api-client/zod"
import { Badge } from "@workspace/ui/components/badge"
import { capitalize } from "@/lib/utils"

// Colored through `stroke`, not `color`: select and menu items set `color` on
// every descendant on focus (`focus:**:text-accent-foreground`), including the
// icon's inner <path>s, which draw with `currentColor`. A concrete stroke on the
// <svg> is inherited by the paths as is, so the focus color doesn't reach it.
export const productStatusIcons: Record<ProductStatus, React.JSX.Element> = {
  active: (
    <CircleCheckIcon className="stroke-green-500 dark:stroke-green-400" />
  ),
  inactive: <CircleXIcon className="stroke-red-500 dark:stroke-red-400" />,
  draft: <LoaderIcon />,
  out_of_stock: (
    <PackageXIcon className="stroke-orange-500 dark:stroke-orange-400" />
  ),
  discontinued: <ArchiveXIcon className="stroke-red-500 dark:stroke-red-400" />,
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return (
    <Badge variant="outline" className="capitalize">
      {productStatusIcons[status]} {status.replaceAll("_", " ")}
    </Badge>
  )
}

export const productStatusOptions = zProductStatus.options.map((status) => ({
  label: capitalize(status.replaceAll("_", " ")),
  value: status,
  icon: productStatusIcons[status],
}))
