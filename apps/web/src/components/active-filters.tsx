"use client"
import { Button } from "@workspace/ui/components/button"
import { XIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { useBrands } from "@/components/brands-provider"
import { productParams } from "@/lib/product-params"

/**
 * What narrows the listing (the search, brands, "In stock", "On sale"), each
 * with a click to take it out. Nothing when nothing does.
 */
export function ActiveFilters() {
  const brands = useBrands()
  const [{ search, brand, in_stock: inStock, on_sale: onSale }, setParams] =
    useQueryStates(productParams, { shallow: false })

  const chips = [
    search && {
      label: `“${search}”`,
      remove: () => setParams({ search: null, page: null }),
    },
    ...brand.map((slug) => ({
      label: brands.find((b) => b.slug === slug)?.name ?? slug,
      remove: () => {
        const rest = brand.filter((other) => other !== slug)
        setParams({ brand: rest.length ? rest : null, page: null })
      },
    })),
    inStock && {
      label: "In stock",
      remove: () => setParams({ in_stock: null, page: null }),
    },
    onSale && {
      label: "On sale",
      remove: () => setParams({ on_sale: null, page: null }),
    },
  ].filter((chip) => !!chip)

  if (!chips.length) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Button
          key={chip.label}
          variant="secondary"
          size="xs"
          onClick={chip.remove}
          aria-label={`Remove ${chip.label}`}
        >
          {chip.label}
          <XIcon data-icon="inline-end" />
        </Button>
      ))}
      {chips.length > 1 && (
        <Button
          variant="ghost"
          size="xs"
          onClick={() =>
            setParams({
              search: null,
              brand: null,
              in_stock: null,
              on_sale: null,
              page: null,
            })
          }
        >
          Clear all
        </Button>
      )}
    </div>
  )
}
