import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { RevocationsListData, RevocationStatus } from "@workspace/api-client"
import { revocationsListOptions } from "@workspace/api-client/query"
import { zRevocationStatus } from "@workspace/api-client/zod"
import { DataTable } from "@workspace/data-table/components/data-table"
import { DataTableAdvancedToolbar } from "@workspace/data-table/components/data-table-advanced-toolbar"
import { useDataTable } from "@workspace/data-table/hooks/use-data-table"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { parseAsStringLiteral, useQueryState } from "nuqs"
import { useMemo } from "react"
import { SearchInput } from "@/components/search-input"
import { useDebounce } from "@/hooks/use-debounce"
import { useOrdering } from "@/hooks/use-ordering"
import { usePagination } from "@/hooks/use-pagination"
import { useSearch } from "@/hooks/use-search"
import { revocationStatuses } from "../_lib/revocation-status"
import { revocationColumns } from "./revocation-columns"

const tabs = ["all", ...zRevocationStatus.options] as const

export function RevocationsTable() {
  const ordering = useOrdering()
  const pagination = usePagination()
  const [search, setSearch] = useSearch()
  // The open ones first: they have a deadline.
  const [tab, setTab] = useQueryState(
    "status",
    parseAsStringLiteral(tabs).withDefault("requested")
  )

  const debouncedSearch = useDebounce(search, 300)

  const queryFilters = useMemo<RevocationsListData["query"]>(
    () => ({
      ...pagination,
      ordering,
      search: debouncedSearch || undefined,
      status: tab === "all" ? undefined : (tab as RevocationStatus),
    }),
    [pagination, ordering, debouncedSearch, tab]
  )

  const { data } = useQuery({
    ...revocationsListOptions({ query: queryFilters }),
    placeholderData: keepPreviousData,
  })

  const table = useDataTable({ data, columns: revocationColumns })

  return (
    <div className="flex flex-col gap-4">
      <Tabs value={tab} onValueChange={(value) => setTab(value)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          {zRevocationStatus.options.map((value) => (
            <TabsTrigger key={value} value={value}>
              {revocationStatuses[value].label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <DataTable
        table={table}
        onClearFilters={search ? () => setSearch("") : undefined}
      >
        <DataTableAdvancedToolbar table={table}>
          <SearchInput
            className="w-64"
            value={search}
            onValueChange={setSearch}
            count={data?.count}
            placeholder="Search requests..."
          />
        </DataTableAdvancedToolbar>
      </DataTable>
    </div>
  )
}
