"use client"

import { useState, useMemo } from "react"
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

import { useProductColumns } from "./columns"
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
  AppHeaderNav,
} from "@/components/app-header"
import { SectionGroup } from "@/components/section"
import { useDataTable } from "@workspace/data-table/hooks/use-data-table"
import { DataTable } from "@workspace/data-table/components/data-table"
import { parseAsArrayOf, parseAsStringEnum } from "nuqs"
import { zProductStatus } from "@workspace/api-client/zod"
import { useFilters } from "@/hooks/use-filters"
import { useOrdering } from "@/hooks/use-ordering"
import { usePagination } from "@/hooks/use-pagination"
import { DataTableToolbar } from "@workspace/data-table/components/data-table-toolbar"
import { DataTableAdvancedToolbar } from "@workspace/data-table/components/data-table-advanced-toolbar"
import { DataTableFilterMenu } from "@workspace/data-table/components/data-table-filter-menu"
import { useIsMobile } from "@workspace/ui/hooks/use-mobile"

const DEBOUNCE_DELAY = 300

const columnVisibility = { description: false }

export default function Page() {
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
    <>
      <AppHeader>
        <AppHeaderNav items={[{ type: "page", label: "Products" }]} />
        <AppHeaderActions>
          <QuickCreateProductDialog />
        </AppHeaderActions>
      </AppHeader>
      <SectionGroup>
        <DataTable table={table}>
          {isMobile ? (
            <DataTableAdvancedToolbar table={table}>
              <DataTableFilterMenu table={table} />
            </DataTableAdvancedToolbar>
          ) : (
            <DataTableToolbar table={table} />
          )}
        </DataTable>
      </SectionGroup>
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
