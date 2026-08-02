"use client"
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { columns } from "./columns"
import { useDebounce } from "@/hooks/use-debounce"
import {
  categoriesListOptions,
  categoriesListQueryKey,
} from "@workspace/api-client/query"
import { SectionGroup } from "@/components/section"
import { useDataTable, useFilters, usePagination } from "@workspace/data-table"
import { useMemo } from "react"
import { CategoriesListData } from "@workspace/api-client"
import { DataTable } from "@workspace/data-table/components/data-table"
import { DataTableToolbar } from "@workspace/data-table/components/data-table-toolbar"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { SearchIcon } from "lucide-react"
import { parseAsString, useQueryState } from "nuqs"

const DEBOUNCE_DELAY = 300

export default function CategoriesPage() {
  const queryClient = useQueryClient()

  const pagination = usePagination()
  const columnFilters = useFilters(columns, {})
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  )

  const queryFilters = useMemo<CategoriesListData["query"]>(
    () => ({ ...columnFilters, search }),
    [columnFilters, search]
  )

  const debouncedQueryFilters = useDebounce(queryFilters, DEBOUNCE_DELAY)

  const query = useMemo<CategoriesListData["query"]>(
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
        categoriesListQueryKey({ query: immediateQuery })
      ) !== undefined,
    [queryClient, immediateQuery]
  )

  const activeFilters = isCached ? immediateQuery : query

  const { data } = useQuery({
    ...categoriesListOptions({ query: activeFilters }),
    placeholderData: keepPreviousData,
  })

  const table = useDataTable({ data, columns })

  return (
    <SectionGroup>
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <InputGroup>
            <InputGroupInput
              type="search"
              inputMode="search"
              placeholder="Search for categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
        </DataTableToolbar>
      </DataTable>
    </SectionGroup>
  )
}
