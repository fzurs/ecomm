"use client"
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderNav,
} from "@/components/app-header"
import { SectionGroup } from "@/components/section"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { customersListOptions } from "@workspace/api-client/query"
import { Button } from "@workspace/ui/components/button"
import { UserPlusIcon } from "lucide-react"
import { columns } from "./columns"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { CustomerForm, useCustomerForm } from "./form"
import { useDataTable, usePagination, useSorting } from "@workspace/data-table"
import { DataTable } from "@workspace/data-table/components/data-table"
import { useMemo } from "react"
import { CustomersListData } from "@workspace/api-client"
import { DataTableToolbar } from "@workspace/data-table/components/data-table-toolbar"
import { SearchInput } from "@/components/search-input"
import { parseAsString, useQueryState } from "nuqs"
import { useDebounce } from "@/hooks/use-debounce"

export default function CustomersPage() {
  const sorting = useSorting()
  const pagination = usePagination()

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  )
  const debouncedSearch = useDebounce(search, 300)

  const queryFilters = useMemo<CustomersListData["query"]>(
    () => ({ ...pagination, ...sorting, debouncedSearch }),
    [pagination, sorting, debouncedSearch]
  )

  const { data } = useQuery({
    ...customersListOptions({ query: queryFilters }),
    placeholderData: keepPreviousData,
  })

  const table = useDataTable({ data, columns })

  return (
    <>
      <AppHeader>
        <AppHeaderNav items={[{ type: "page", label: "Customers" }]} />
        <AppHeaderActions>
          <CreateCustomerDialog />
        </AppHeaderActions>
      </AppHeader>
      <SectionGroup>
        <DataTable table={table}>
          <DataTableToolbar table={table}>
            <SearchInput
              value={search}
              onValueChange={setSearch}
              count={data?.count}
              placeholder="Search for a customers..."
            />
          </DataTableToolbar>
        </DataTable>
      </SectionGroup>
    </>
  )
}

function CreateCustomerDialog() {
  const form = useCustomerForm()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlusIcon />
          New
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Customer</DialogTitle>
        </DialogHeader>
        <CustomerForm form={form} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
          <form.AppForm>
            <form.Submit>Save</form.Submit>
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
