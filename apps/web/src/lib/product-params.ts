import type { ProductsListData } from "@workspace/api-client"
import {
  createLoader,
  createSerializer,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server"

export const PAGE_SIZE = 12

export const SORTS = {
  featured: { label: "Featured", ordering: "-featured,-created_at" },
  newest: { label: "Newest", ordering: "-created_at" },
  "price-asc": { label: "Price: low to high", ordering: "active_price" },
  "price-desc": { label: "Price: high to low", ordering: "-active_price" },
  name: { label: "Name", ordering: "name" },
} as const

export type Sort = keyof typeof SORTS

/**
 * The URL of a listing page: the header's search, the toolbar's sort and
 * filters, and the page. The server reads them (`loadProductParams`) and the
 * client components write them with the same parsers.
 */
export const productParams = {
  search: parseAsString.withDefault(""),
  sort: parseAsStringLiteral(Object.keys(SORTS) as Sort[]).withDefault(
    "featured"
  ),
  brand: parseAsArrayOf(parseAsString).withDefault([]),
  in_stock: parseAsBoolean.withDefault(false),
  on_sale: parseAsBoolean.withDefault(false),
  page: parseAsInteger.withDefault(1),
}

export const loadProductParams = createLoader(productParams)

export type ProductParams = Awaited<ReturnType<typeof loadProductParams>>

/** The link to `pathname` with these params; the defaults stay out of the URL. */
export const productsHref = createSerializer(productParams)

/** What the API takes for these params (one page). */
export function productsQuery({
  search,
  sort,
  brand,
  in_stock: inStock,
  on_sale: onSale,
  page,
}: ProductParams): ProductsListData["query"] {
  return {
    search: search || undefined,
    ordering: SORTS[sort].ordering,
    brand: brand.length ? brand : undefined,
    // The API only shows products for sale: active or out of stock.
    status: inStock ? ["active"] : undefined,
    discount_percent__gt: onSale ? 0 : undefined,
    limit: PAGE_SIZE,
    offset: (Math.max(page, 1) - 1) * PAGE_SIZE,
  }
}

/** The params narrow the listing (not the sort or the page). */
export function isFiltered({
  search,
  brand,
  in_stock,
  on_sale,
}: ProductParams) {
  return !!search || brand.length > 0 || in_stock || on_sale
}
