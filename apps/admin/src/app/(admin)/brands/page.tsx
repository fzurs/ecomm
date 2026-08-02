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
import { useDataTable, usePagination } from "@workspace/data-table"
import { DataTable } from "@workspace/data-table/components/data-table"
import { useState } from "react"

export default function BrandsPage() {
  const pagination = usePagination()

  const { data } = useQuery({
    ...brandsListOptions({ query: pagination }),
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
        <DataTable table={table} showToolbar={false} />
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
