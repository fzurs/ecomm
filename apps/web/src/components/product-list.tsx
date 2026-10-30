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
import { ProductFilters } from "@/components/product-filters"
import { ProductPagination } from "@/components/product-pagination"
import { ProductsGrid } from "@/components/products-grid"
import { getProducts } from "@/lib/cache"
import {
  isFiltered,
  loadProductParams,
  PAGE_SIZE,
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
  const products = await getProducts({ ...filters, ...productsQuery(params) })
  const pageCount = Math.ceil(products.count / PAGE_SIZE)

  return (
    <div className="flex flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {products.count} {products.count === 1 ? "product" : "products"}
          {params.search && <> for &ldquo;{params.search}&rdquo;</>}
        </p>
        <ProductFilters />
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
