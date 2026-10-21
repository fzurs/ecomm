import {
  IconCircleDashedCheck,
  IconCircleDashedX,
  IconLoader,
  IconPackageOff,
  IconTrashX,
} from "@tabler/icons-react"
import { ProductStatus } from "@workspace/api-client"
import { zProductStatus } from "@workspace/api-client/zod"
import { capitalize } from "@/lib/utils"

export const productStatusIcons: Record<ProductStatus, React.JSX.Element> = {
  active: <IconCircleDashedCheck className="text-green-500" />,
  inactive: <IconCircleDashedX className="text-red-500" />,
  draft: <IconLoader />,
  out_of_stock: <IconPackageOff className="text-orange-500" />,
  discontinued: <IconTrashX className="text-red-500" />,
}

export const productStatusOptions = zProductStatus.options.map((status) => ({
  label: capitalize(status.replaceAll("_", " ")),
  value: status,
  icon: productStatusIcons[status],
}))
