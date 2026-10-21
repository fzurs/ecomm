import { useMemo } from "react"
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { formatISO } from "date-fns"
import { parseAsArrayOf, parseAsStringEnum } from "nuqs"
import { ProductsListData } from "@workspace/api-client"
import {
  productsListOptions,
  productsListQueryKey,
} from "@workspace/api-client/query"
import { zProductStatus } from "@workspace/api-client/zod"
import { useDataTable } from "@workspace/data-table/hooks/use-data-table"
import { DataTable } from "@workspace/data-table/components/data-table"
import { DataTableToolbar } from "@workspace/data-table/components/data-table-toolbar"
import { DataTableAdvancedToolbar } from "@workspace/data-table/components/data-table-advanced-toolbar"
import { DataTableFilterMenu } from "@workspace/data-table/components/data-table-filter-menu"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"
import { useDebounce } from "@/hooks/use-debounce"
import { useFilters } from "@/hooks/use-filters"
import { useOrdering } from "@/hooks/use-ordering"
import { usePagination } from "@/hooks/use-pagination"
import { useProductColumns } from "./product-columns"

const DEBOUNCE_DELAY = 300

const columnVisibility = { description: false }

export function ProductsTable() {
  const queryClient = useQueryClient()
  const isMobile = useIsMobile()

  const columns = useProductColumns()

  const pagination = usePagination()
  const ordering = useOrdering()
  const columnFilters = useFilters(columns, {
    status: parseAsArrayOf(parseAsStringEnum(zProductStatus.options)),
  })

  const queryFilters = useMemo<ProductsListData["query"]>(() => {
    const {
      name: search,
      price,
      discount_price,
      created_at,
      ...rest
    } = columnFilters

    const [price_min, price_max] = price ?? []
    const [discount_price_min, discount_price_max] = discount_price ?? []

    const [created_at_after, created_at_before] =
      created_at?.map((date) => formatISO(date, { representation: "date" })) ??
      []

    return {
      ...rest,
      ordering,
      search,
      price_min,
      price_max,
      discount_price_min,
      discount_price_max,
      created_at_after,
      created_at_before,
    }
  }, [ordering, columnFilters])

  const debouncedQueryFilters = useDebounce(queryFilters, DEBOUNCE_DELAY)

  const query = useMemo<ProductsListData["query"]>(
    () => ({
      ...debouncedQueryFilters,
      ...pagination,
    }),
    [debouncedQueryFilters, pagination]
  )

  const immediateQuery = useMemo(
    () => ({
      ...queryFilters,
      ...pagination,
    }),
    [queryFilters, pagination]
  )

  const isCached = useMemo(
    () =>
      queryClient.getQueryData(
        productsListQueryKey({ query: immediateQuery })
      ) !== undefined,
    [queryClient, immediateQuery]
  )

  const activeFilters = isCached ? immediateQuery : query

  const { data } = useQuery({
    ...productsListOptions({ query: activeFilters }),
    placeholderData: keepPreviousData,
  })

  const table = useDataTable({
    data,
    columns,
    initialState: { columnVisibility },
  })

  return (
    <DataTable table={table}>
      {isMobile ? (
        <DataTableAdvancedToolbar table={table}>
          <DataTableFilterMenu table={table} />
        </DataTableAdvancedToolbar>
      ) : (
        <DataTableToolbar table={table} />
      )}
    </DataTable>
  )
}
