"use client"
import { DataTable } from "@/components/data-table/data-table"
import {
  PageContent,
  PageHeader,
  PageHeaderHeading,
} from "@/components/page-header"
import { useDataTable } from "@/hooks/use-data-table"
import { getCategoriesQueryOptions } from "@/lib/query-options"
import { useQuery } from "@tanstack/react-query"
import { columns } from "./columns"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"
import { parseAsString, useQueryState } from "nuqs"
import { useDebounce } from "@/hooks/use-debounce"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@workspace/ui/components/input-group"
import { SearchIcon } from "lucide-react"

const DEBOUNCE_DELAY = 300

export default function CategoriesPage() {
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""))

  const filters = useDebounce({ search }, DEBOUNCE_DELAY)
  const { data, isSuccess } = useQuery(getCategoriesQueryOptions(filters))

  const table = useDataTable({ data, columns })

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Categories</PageHeaderHeading>
      </PageHeader>
      <PageContent>
        <DataTable table={table}>
          <div className="flex gap-2 md:gap-4">
            <InputGroup>
              <InputGroupInput
                placeholder="Search for a categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              {search.trim() && filters.search.trim() && isSuccess && (
                <InputGroupAddon align="inline-end">
                  <InputGroupText>{data.count} results</InputGroupText>
                </InputGroupAddon>
              )}
            </InputGroup>
            <DataTableViewOptions table={table} />
          </div>
        </DataTable>
      </PageContent>
    </>
  )
}
