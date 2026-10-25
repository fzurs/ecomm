import {
  ArchiveXIcon,
  CircleCheckIcon,
  CircleXIcon,
  LoaderIcon,
  PackageXIcon,
} from "lucide-react"
import { ProductStatus } from "@workspace/api-client"
import { zProductStatus } from "@workspace/api-client/zod"

// Keyed by the generated enum: a status added in the API fails the typecheck
// until it gets its label and icon here.
//
// Icons are colored through `stroke`, not `color`: select and menu items set
// `color` on every descendant on focus (`focus:**:text-accent-foreground`),
// including the icon's inner <path>s, which draw with `currentColor`. A
// concrete stroke on the <svg> is inherited by the paths as is, so the focus
// color doesn't reach it.
export const productStatuses: Record<
  ProductStatus,
  { label: string; icon: React.JSX.Element }
> = {
  draft: { label: "Draft", icon: <LoaderIcon /> },
  active: {
    label: "Active",
    icon: (
      <CircleCheckIcon className="stroke-green-500 dark:stroke-green-400" />
    ),
  },
  inactive: {
    label: "Inactive",
    icon: <CircleXIcon className="stroke-red-500 dark:stroke-red-400" />,
  },
  out_of_stock: {
    label: "Out of stock",
    icon: <PackageXIcon className="stroke-orange-500 dark:stroke-orange-400" />,
  },
  discontinued: {
    label: "Discontinued",
    icon: <ArchiveXIcon className="stroke-red-500 dark:stroke-red-400" />,
  },
}

// In the API's order, for selects and filters.
export const productStatusOptions = zProductStatus.options.map((value) => ({
  value,
  ...productStatuses[value],
}))
