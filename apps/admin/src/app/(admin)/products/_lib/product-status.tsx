import {
  ArchiveXIcon,
  CircleCheckIcon,
  CircleXIcon,
  LoaderIcon,
  PackageXIcon,
} from "lucide-react"
import { ProductStatus } from "@workspace/api-client"
import { zProductStatus } from "@workspace/api-client/zod"
import { capitalize } from "@/lib/utils"

export const productStatusIcons: Record<ProductStatus, React.JSX.Element> = {
  active: <CircleCheckIcon className="text-green-500" />,
  inactive: <CircleXIcon className="text-red-500" />,
  draft: <LoaderIcon />,
  out_of_stock: <PackageXIcon className="text-orange-500" />,
  discontinued: <ArchiveXIcon className="text-red-500" />,
}

export const productStatusOptions = zProductStatus.options.map((status) => ({
  label: capitalize(status.replaceAll("_", " ")),
  value: status,
  icon: productStatusIcons[status],
}))
