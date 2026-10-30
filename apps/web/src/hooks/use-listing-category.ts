"use client"
import { usePathname, useRouter } from "next/navigation"
import { useQueryStates } from "nuqs"
import { useCategories } from "@/components/categories-provider"
import { productParams, productsHref } from "@/lib/product-params"

/**
 * The category the listing shows (its page, `/<slug>`), or null on the home.
 * A category is a page and not a filter, so `goTo` navigates to it, keeping
 * the search and the filters and starting on its first page.
 */
export function useListingCategory() {
  const categories = useCategories()
  const pathname = usePathname()
  const router = useRouter()
  const [params] = useQueryStates(productParams)

  const current =
    categories.find((category) => `/${category.slug}` === pathname) ?? null

  function goTo(slug: string | null | undefined) {
    router.push(
      productsHref(slug ? `/${slug}` : "/", { ...params, page: null })
    )
  }

  return { categories, current, goTo }
}
