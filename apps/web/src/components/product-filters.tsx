"use client"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Toggle } from "@workspace/ui/components/toggle"
import { BadgePercentIcon, PackageCheckIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { useBrands } from "@/components/brands-provider"
import { productParams, type Sort, SORTS } from "@/lib/product-params"

const sortItems = Object.entries(SORTS).map(([value, { label }]) => ({
  value,
  label,
}))

/**
 * The listing's sort and filters, in the URL: the page reads them on the
 * server. Changing any goes back to the first page.
 */
export function ProductFilters({ byBrand = true }: { byBrand?: boolean }) {
  const [{ sort, in_stock: inStock, on_sale: onSale }, setParams] =
    useQueryStates(productParams, { shallow: false })

  return (
    <div className="flex flex-wrap items-center gap-2">
      {byBrand && <BrandFilter />}
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
          <SelectGroup>
            {sortItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

/** Brands to narrow the listing to (a brand's page doesn't show it). */
function BrandFilter() {
  const brands = useBrands()
  const [{ brand: selected }, setParams] = useQueryStates(
    { brand: productParams.brand, page: productParams.page },
    { shallow: false }
  )
  const items = brands.map(({ slug, name }) => ({ value: slug, label: name }))

  return (
    <Select
      multiple
      items={items}
      value={selected}
      onValueChange={(value) =>
        setParams({ brand: value.length ? value : null, page: null })
      }
    >
      <SelectTrigger size="sm" aria-label="Brands" className="min-w-36">
        <SelectValue>
          {(value: string[]) =>
            value.length === 0
              ? "All brands"
              : value.length === 1
                ? items.find((item) => item.value === value[0])?.label
                : `${value.length} brands`
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
