import { Product } from "@workspace/api-client"
import { cn } from "cn"
import { format } from "date-fns"
import {
  BanknoteIcon,
  BarcodeIcon,
  CalendarIcon,
  CircleDashedIcon,
  LayoutGridIcon,
  PercentIcon,
  StarIcon,
  TagIcon,
} from "lucide-react"
import { formatPrice } from "@/lib/utils"
import { ProductStatusBadge } from "./product-status-badge"

export function ProductDetails({
  product,
  className,
  ...props
}: { product: Product } & React.ComponentProps<"dl">) {
  const rows = [
    { label: "SKU", value: product.sku, icon: BarcodeIcon },
    {
      label: "Status",
      value: product.status && <ProductStatusBadge status={product.status} />,
      icon: CircleDashedIcon,
    },
    { label: "Category", value: product.category?.name, icon: LayoutGridIcon },
    { label: "Brand", value: product.brand?.name, icon: TagIcon },
    { label: "Price", value: formatPrice(product.price), icon: BanknoteIcon },
    {
      label: "Discount",
      value: product.discount_percent != null && `${product.discount_percent}%`,
      icon: PercentIcon,
    },
    {
      label: "Featured",
      value: product.featured ? "Yes" : "No",
      icon: StarIcon,
    },
    {
      label: "Created",
      value: format(product.created_at, "LLL dd, y"),
      icon: CalendarIcon,
    },
  ]
  return (
    <dl
      className={cn(
        "grid grid-cols-[auto_1fr] items-center gap-x-6 gap-y-0",
        className
      )}
      {...props}
    >
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <dt className="flex items-center gap-2 py-2 text-muted-foreground">
            <row.icon className="size-4" />
            {row.label}
          </dt>
          <dd className="py-2 tabular-nums">
            {row.value || <span className="text-muted-foreground">—</span>}
          </dd>
        </div>
      ))}
    </dl>
  )
}
