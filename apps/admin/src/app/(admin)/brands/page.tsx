"use client"
import { DataTable } from "@/components/data-table/data-table"
import {
  PageHeader,
  PageHeaderAction,
  PageHeaderHeading,
} from "@/components/page-header"
import { useDataTable } from "@/hooks/use-data-table"
import { getBrandsQueryOptions } from "@/lib/query-options"
import { useQuery } from "@tanstack/react-query"
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
import * as React from "react"

export default function BrandsPage() {
  const { data } = useQuery(getBrandsQueryOptions())

  const table = useDataTable({ data, columns })

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Brands</PageHeaderHeading>
        <PageHeaderAction>
          <QuickCreateBrandDialog />
        </PageHeaderAction>
      </PageHeader>
      <div className="@container/main flex py-4 md:py-6">
        <DataTable table={table} showToolbar={false} showPagination={false} />
      </div>
    </>
  )
}

function QuickCreateBrandDialog() {
  const [open, setOpen] = React.useState(false)

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
            <form.SubscribeButton>Create</form.SubscribeButton>
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
