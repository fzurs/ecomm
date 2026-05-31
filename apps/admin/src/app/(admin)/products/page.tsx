"use client"

import { DataTable } from "@/components/data-table/data-table"
import {
  PageAction,
  PageContent,
  PageHeader,
  PageTitle,
} from "@/components/page-header"
import { useDataTable } from "@/hooks/use-data-table"
import { usePaginationValues } from "@/hooks/use-pagination"
import { useSortingValues } from "@/hooks/use-sorting"
import React, { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
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
import { queryKeys, useProducts } from "@/lib/query-options"
import { useColumnFilterValues } from "@/hooks/use-column-filters"
import { useDebounce } from "@/hooks/use-debounce"
import { useProductForm } from "./form"
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

export default function Page() {
  const queryClient = useQueryClient()

  const pagination = usePaginationValues()
  const sorting = useSortingValues()
  const columnFilters = useColumnFilterValues(columns)

  const filters = React.useMemo(() => {
    const { name: search, ...rest } = columnFilters
    return { ...pagination, ...sorting, ...rest, search }
  }, [pagination, sorting, columnFilters])

  const isCached =
    queryClient.getQueryData(queryKeys.getProducts(filters)) !== undefined
  const debouncedFilters = useDebounce(filters, isCached ? 0 : 300)

  const { data } = useProducts(debouncedFilters)

  const table = useDataTable({
    data,
    columns,
    initialState: { columnVisibility: { description: false } },
    defaultColumn: {
      enableColumnFilter: true,
      enableSorting: true,
    },
  })

  return (
    <>
      <PageHeader>
        <PageTitle>Products</PageTitle>
        <PageAction>
          <QuickCreateProductDialog />
        </PageAction>
      </PageHeader>
      <PageContent>
        <DataTable table={table} />
      </PageContent>
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
          <DialogDescription className="sr-only">
            Fill in the basic details to quickly add a new product to your
            catalog.
          </DialogDescription>
        </DialogHeader>
        <form
          id={form.formId}
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <form.Field
            name="name"
            children={(field) => {
              const fieldId = `${form.formId}-${field.name}`
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={fieldId}>Name</FieldLabel>
                  <Input
                    id={fieldId}
                    name={field.name}
                    value={field.state.value as string}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    required
                    placeholder="e.g. AMD Ryzen 9 7950X"
                    autoFocus
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Close</Button>
          </DialogClose>
          <form.Subscribe
            selector={(state) => [state.isSubmitting, state.isPristine]}
            children={([isSubmitting, isPristine]) => (
              <Button
                type="submit"
                disabled={isSubmitting || isPristine}
                form={form.formId}
              >
                Create
              </Button>
            )}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
