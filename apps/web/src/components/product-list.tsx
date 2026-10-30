import type { ProductsListData } from "@workspace/api-client"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { buttonVariants } from "@workspace/ui/components/button"
import { SearchXIcon } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ProductFilters } from "@/components/product-filters"
import { ProductPagination } from "@/components/product-pagination"
import { ProductsGrid } from "@/components/products-grid"
import { getProducts } from "@/lib/cache"
import {
  isFiltered,
  loadProductParams,
  PAGE_SIZE,
  productsHref,
  productsQuery,
} from "@/lib/product-params"

/**
 * The products of a listing page (`pathname`), with the search, sort, filters
 * and page of its URL. Reading them makes this part dynamic: render it inside
 * a <Suspense> (with `ProductGridSkeleton`).
 */
export async function ProductList({
  pathname,
  searchParams,
  filters,
}: {
  pathname: string
  searchParams: Promise<Record<string, string | string[] | undefined>>
  /** What the page lists: a category, a brand. */
  filters?: ProductsListData["query"]
}) {
  const params = await loadProductParams(searchParams)
  // The page's own filter wins: a brand's page lists that brand.
  const products = await getProducts({ ...productsQuery(params), ...filters })
  const pageCount = Math.ceil(products.count / PAGE_SIZE)
  // A page past the end (an old link, fewer results now): the last one.
  if (products.count && (params.page < 1 || params.page > pageCount)) {
    const page = Math.min(Math.max(params.page, 1), pageCount)
    redirect(productsHref(pathname, { ...params, page }))
  }
  const first = (params.page - 1) * PAGE_SIZE + 1
  const last = first + products.results.length - 1

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {pageCount > 1 && (
            <>
              {first}–{last} of{" "}
            </>
          )}
          {products.count} {products.count === 1 ? "product" : "products"}
          {params.search && <> for &ldquo;{params.search}&rdquo;</>}
        </p>
        <ProductFilters byBrand={!filters?.brand} />
      </div>
      {products.results.length ? (
        <ProductsGrid products={products.results} />
      ) : (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchXIcon />
            </EmptyMedia>
            <EmptyTitle>No products found</EmptyTitle>
            <EmptyDescription>
              {isFiltered(params)
                ? "Try other words, or fewer filters."
                : "There's nothing here yet. Come back soon."}
            </EmptyDescription>
          </EmptyHeader>
          {isFiltered(params) && (
            <EmptyContent>
              <Link
                href={pathname}
                className={buttonVariants({ variant: "outline" })}
              >
                Clear search and filters
              </Link>
            </EmptyContent>
          )}
        </Empty>
      )}
      <ProductPagination
        pathname={pathname}
        params={params}
        pageCount={pageCount}
      />
    </div>
  )
}
