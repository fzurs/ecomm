"use client"
import { DataTable } from "@/components/data-table/data-table"
import {
  PageHeader,
  PageHeaderActions,
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
import { SearchIcon } from "lucide-react"
import * as React from "react"
import { CategoryForm, useCategoryForm } from "./form"
import { IconTagPlus } from "@tabler/icons-react"
import { usePaginationValues } from "@/hooks/use-pagination"

const DEBOUNCE_DELAY = 300

export default function CategoriesPage() {
  const pagination = usePaginationValues()
  const [search, setSearch] = useQueryState("q", parseAsString.withDefault(""))

  const filters = useDebounce({ search }, DEBOUNCE_DELAY)
  const { data, isSuccess } = useQuery(
    getCategoriesQueryOptions({ ...filters, ...pagination })
  )

  const table = useDataTable({ data, columns })

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Categories</PageHeaderHeading>
        <PageHeaderActions>
          <CreateCategoryDialog />
        </PageHeaderActions>
      </PageHeader>
      <div className="@container/main flex py-4 md:py-6">
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
      </div>
    </>
  )
}

function CreateCategoryDialog() {
  const [open, setOpen] = React.useState(false)

  const form = useCategoryForm({ setOpen })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <IconTagPlus />
          Quick Create
        </Button>
      </DialogTrigger>
      <DialogContent
        onAnimationEnd={(e) => {
          if (!open && e.animationName === "exit") form.reset()
        }}
      >
        <DialogHeader>
          <DialogTitle>Create Category</DialogTitle>
          <DialogDescription className="sr-only">
            These categories can be assigned to products to be able to filter
            and sort them.
          </DialogDescription>
        </DialogHeader>
        <CategoryForm form={form} variant="required" />
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
