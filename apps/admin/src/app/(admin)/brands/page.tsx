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
import { SectionGroup } from "@/components/section"
import { useDataTable, usePagination, useSorting } from "@workspace/data-table"
import { DataTable } from "@workspace/data-table/components/data-table"
import { useMemo, useState } from "react"
import { BrandsListData } from "@workspace/api-client"
import { DataTableToolbar } from "@workspace/data-table/components/data-table-toolbar"
import { parseAsString, useQueryState } from "nuqs"
import { useDebounce } from "@/hooks/use-debounce"
import { SearchInput } from "@/components/search-input"

export default function BrandsPage() {
  const sorting = useSorting()
  const pagination = usePagination()
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  )

  const debouncedSearch = useDebounce(search, 300)

  const queryFilters = useMemo<BrandsListData["query"]>(
    () => ({ ...pagination, ...sorting, search: debouncedSearch || undefined }),
    [pagination, sorting, debouncedSearch]
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
      <SectionGroup>
        <DataTable table={table}>
          <DataTableToolbar table={table}>
            <SearchInput
              value={search}
              onValueChange={setSearch}
              count={data?.count}
              placeholder="Search for a brands..."
            />
          </DataTableToolbar>
        </DataTable>
      </SectionGroup>
    </>
  )
}

function QuickCreateBrandDialog() {
  const [open, setOpen] = useState(false)

  const form = useBrandForm({ setOpen })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          Add New
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Brand</DialogTitle>
        </DialogHeader>
        <BrandForm form={form} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <form.AppForm>
            <form.Submit>Create</form.Submit>
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
