import { useMemo } from "react"
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { formatISO } from "date-fns"
import { parseAsArrayOf, parseAsStringEnum, useQueryState } from "nuqs"
import { ProductsListData } from "@workspace/api-client"
import {
  productsListOptions,
  productsListQueryKey,
} from "@workspace/api-client/query"
import { zProductStatus } from "@workspace/api-client/zod"
import { useDataTable } from "@workspace/data-table/hooks/use-data-table"
import { DataTable } from "@workspace/data-table/components/data-table"
import { DataTableAdvancedToolbar } from "@workspace/data-table/components/data-table-advanced-toolbar"
import { DataTableFilterMenu } from "@workspace/data-table/components/data-table-filter-menu"
import { DataTableToolbar } from "@workspace/data-table/components/data-table-toolbar"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import { ListCollapseIcon, SlidersHorizontalIcon } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { useFilters } from "@/hooks/use-filters"
import { useOrdering } from "@/hooks/use-ordering"
import { usePagination } from "@/hooks/use-pagination"
import { useProductColumns } from "../_hooks/use-product-columns"

const DEBOUNCE_DELAY = 300

const columnVisibility = { sku: false, description: false }

export function ProductsTable() {
  const queryClient = useQueryClient()

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
      discount_percent,
      created_at,
      ...rest
    } = columnFilters

    const [price_min, price_max] = price ?? []
    const [discount_percent_min, discount_percent_max] = discount_percent ?? []

    const [created_at_after, created_at_before] =
      created_at?.map((date) => formatISO(date, { representation: "date" })) ??
      []

    return {
      ...rest,
      ordering,
      search,
      price_min,
      price_max,
      discount_percent_min,
      discount_percent_max,
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

  const [filterView, setFilterView] = useQueryState(
    "filterView",
    parseAsStringEnum<FilterView>([...filterViews]).withDefault("menu")
  )

  const filterViewToggle = (
    <FilterViewToggle value={filterView} onValueChange={setFilterView} />
  )

  return (
    <DataTable table={table}>
      {filterView === "toolbar" ? (
        <DataTableToolbar table={table}>{filterViewToggle}</DataTableToolbar>
      ) : (
        <DataTableAdvancedToolbar table={table} actions={filterViewToggle}>
          <DataTableFilterMenu table={table} />
        </DataTableAdvancedToolbar>
      )}
    </DataTable>
  )
}

const filterViews = ["menu", "toolbar"] as const

type FilterView = (typeof filterViews)[number]

/** Switches between the compact filter menu and one control per column. */
function FilterViewToggle({
  value,
  onValueChange,
}: {
  value: FilterView
  onValueChange: (value: FilterView) => void
}) {
  return (
    <ToggleGroup
      variant="outline"
      value={[value]}
      // Ignore deselecting the active item: one view is always selected.
      onValueChange={([next]) => next && onValueChange(next as FilterView)}
    >
      <ToggleGroupItem
        value="menu"
        aria-label="Filter menu"
        title="Filter menu"
      >
        <ListCollapseIcon />
      </ToggleGroupItem>
      <ToggleGroupItem
        value="toolbar"
        aria-label="All filters"
        title="All filters"
      >
        <SlidersHorizontalIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
