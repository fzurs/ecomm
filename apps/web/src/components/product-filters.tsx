"use client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Toggle } from "@workspace/ui/components/toggle"
import { BadgePercentIcon, PackageCheckIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { productParams, type Sort, SORTS } from "@/lib/product-params"

const sortItems = Object.entries(SORTS).map(([value, { label }]) => ({
  value,
  label,
}))

/**
 * The listing's sort and filters, in the URL: the page reads them on the
 * server. Changing any goes back to the first page.
 */
export function ProductFilters() {
  const [{ sort, in_stock: inStock, on_sale: onSale }, setParams] =
    useQueryStates(productParams, { shallow: false })

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle
        variant="outline"
        size="sm"
        pressed={inStock}
        onPressedChange={(pressed) =>
          setParams({ in_stock: pressed || null, page: null })
        }
      >
        <PackageCheckIcon data-icon="inline-start" />
        In stock
      </Toggle>
      <Toggle
        variant="outline"
        size="sm"
        pressed={onSale}
        onPressedChange={(pressed) =>
          setParams({ on_sale: pressed || null, page: null })
        }
      >
        <BadgePercentIcon data-icon="inline-start" />
        On sale
      </Toggle>
      <Select
        items={sortItems}
        value={sort}
        onValueChange={(value) =>
          setParams({ sort: value as Sort, page: null })
        }
      >
        <SelectTrigger size="sm" aria-label="Sort by" className="min-w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortItems.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
