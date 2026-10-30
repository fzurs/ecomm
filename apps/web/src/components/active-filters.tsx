"use client"
import { Button } from "@workspace/ui/components/button"
import { XIcon } from "lucide-react"
import { useQueryStates } from "nuqs"
import { useRouter } from "next/navigation"
import { useBrands } from "@/components/brands-provider"
import { useListingCategory } from "@/hooks/use-listing-category"
import { productParams } from "@/lib/product-params"

/**
 * What narrows the listing (the category, the search, brands, "In stock", "On
 * sale"), each with a click to take it out. Nothing when nothing does.
 */
export function ActiveFilters() {
  const brands = useBrands()
  const { current: category, goTo } = useListingCategory()
  const router = useRouter()
  const [{ search, brand, in_stock: inStock, on_sale: onSale }, setParams] =
    useQueryStates(productParams, { shallow: false })

  const chips = [
    // The category is the page: taking it out goes to the whole catalog.
    category && { label: category.name, remove: () => goTo(null) },
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
            category
              ? router.push("/")
              : setParams({
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
