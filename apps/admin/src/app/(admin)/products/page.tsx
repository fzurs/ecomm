"use client"

import { DataTable } from "@/components/data-table/data-table"
import { useDataTable } from "@/hooks/use-data-table"
import { usePaginationValues } from "@/hooks/use-pagination"
import { useSortingValues } from "@/hooks/use-sorting"
import React, { useState } from "react"
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { PackagePlus } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"

import { columns } from "./columns"
import { useColumnFilterValues } from "@/hooks/use-column-filters"
import { useDebounce } from "@/hooks/use-debounce"
import { formatISO } from "date-fns"
import { ProductForm, useProductForm } from "./form"
import { ProductsListData } from "@workspace/api-client"
import {
  productsListOptions,
  productsListQueryKey,
} from "@workspace/api-client/query"
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderContent,
  AppHeaderSeparator,
  AppHeaderSidebarTrigger,
} from "@/components/app-header"
import { NavBreadcrumb } from "@/components/nav-breadcrumb"

const DEBOUNCE_DELAY = 300

export default function Page() {
  const queryClient = useQueryClient()

  const pagination = usePaginationValues()
  const sorting = useSortingValues()
  const columnFilters = useColumnFilterValues(columns)

  const filters = React.useMemo<ProductsListData["query"]>(() => {
    const {
      name: search,
      price = [],
      discount_price = [],
      created_at = [],
      ...moreFilters
    } = columnFilters
    const [price_min, price_max] = price
    const [discount_price_min, discount_price_max] = discount_price
    const [created_at_after, created_at_before] = created_at.map((date) =>
      formatISO(date, { representation: "date" })
    )
    return {
      ...pagination,
      ...sorting,
      ...moreFilters,
      search,
      price_min,
      price_max,
      discount_price_min,
      discount_price_max,
      created_at_after,
      created_at_before,
    }
  }, [pagination, sorting, columnFilters])

  const isCached =
    queryClient.getQueryData(productsListQueryKey({ query: filters })) !==
    undefined

  const debouncedFilters = useDebounce(filters, DEBOUNCE_DELAY)

  const activeFilters = isCached ? filters : debouncedFilters

  const { data } = useQuery({
    ...productsListOptions({ query: activeFilters }),
    placeholderData: keepPreviousData,
  })

  const table = useDataTable({
    data,
    columns,
    initialState: {
      columnVisibility: { description: false },
    },
    defaultColumn: {
      enableColumnFilter: true,
      enableSorting: true,
    },
  })

  return (
    <>
      <AppHeader>
        <AppHeaderContent>
          <AppHeaderSidebarTrigger />
          <AppHeaderSeparator />
          <NavBreadcrumb items={[{ type: "page", label: "Products" }]} />
        </AppHeaderContent>
        <AppHeaderActions>
          <QuickCreateProductDialog />
        </AppHeaderActions>
      </AppHeader>
      <div className="@container/main flex py-4 md:py-6">
        <DataTable table={table} />
      </div>
    </>
  )
}

function QuickCreateProductDialog() {
  const [open, setOpen] = useState(false)

  const form = useProductForm({ setOpen })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PackagePlus />
          Quick Create
        </Button>
      </DialogTrigger>
      <DialogContent
        onAnimationEnd={(e) => {
          if (!open && e.animationName === "exit") form.reset()
        }}
      >
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
          <DialogDescription className="sr-only">
            Fill in the basic details to quickly add a new product to your
            catalog.
          </DialogDescription>
        </DialogHeader>
        <ProductForm form={form} variant="required" />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
          <form.AppForm>
            <form.Submit>Create</form.Submit>
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
