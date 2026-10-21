"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { PlusIcon } from "lucide-react"
import { columns } from "./columns"
import { BrandForm, useBrandForm } from "./form"
import { brandsListOptions } from "@workspace/api-client/query"
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderNav,
} from "@/components/app-header"
import { useDataTable } from "@workspace/data-table/hooks/use-data-table"
import { useOrdering } from "@/hooks/use-ordering"
import { usePagination } from "@/hooks/use-pagination"
import { DataTable } from "@workspace/data-table/components/data-table"
import { useMemo, useState } from "react"
import { BrandsListData } from "@workspace/api-client"
import { parseAsString, useQueryState } from "nuqs"
import { useDebounce } from "@/hooks/use-debounce"
import { SearchInput } from "@/components/search-input"

export default function BrandsPage() {
  const ordering = useOrdering()
  const pagination = usePagination()
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  )

  const debouncedSearch = useDebounce(search, 300)

  const queryFilters = useMemo<BrandsListData["query"]>(
    () => ({
      ...pagination,
      ordering,
      search: debouncedSearch || undefined,
    }),
    [pagination, ordering, debouncedSearch]
  )

  const { data } = useQuery({
    ...brandsListOptions({ query: queryFilters }),
    placeholderData: keepPreviousData,
  })

  const table = useDataTable({ data, columns })

  return (
    <>
      <AppHeader>
        <AppHeaderNav items={[{ type: "page", label: "Brands" }]} />
        <AppHeaderActions>
          <QuickCreateBrandDialog />
        </AppHeaderActions>
      </AppHeader>
      <main className="@container/main flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6">
        <DataTable table={table}>
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for a brands..."
          />
        </DataTable>
      </main>
    </>
  )
}

function QuickCreateBrandDialog() {
  const [open, setOpen] = useState(false)

  const form = useBrandForm({ setOpen })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" />}>
        <PlusIcon />
        Add New
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Brand</DialogTitle>
        </DialogHeader>
        <BrandForm form={form} />
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Close</DialogClose>
          <form.AppForm>
            <form.SubmitButton>Create</form.SubmitButton>
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
