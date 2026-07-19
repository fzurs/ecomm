"use client"
import { DataTable } from "@/components/data-table/data-table"
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderHeading,
} from "@/components/page-header"
import { useDataTable } from "@/hooks/use-data-table"
import { useQuery } from "@tanstack/react-query"
import { ordersListOptions } from "@workspace/api-client/query"
import { columns } from "./columns"
import { Button } from "@workspace/ui/components/button"
import { ClipboardPlus } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { CreateOrderForm, useCreateOrderForm } from "./form"
import { useState } from "react"

export default function OrdersPage() {
  const { data } = useQuery(ordersListOptions())

  const table = useDataTable({ data, columns })

  return (
    <>
      <PageHeader>
        <PageHeaderHeading>Orders</PageHeaderHeading>
        <PageHeaderActions>
          <CreateOrderDialog />
        </PageHeaderActions>
      </PageHeader>
      <div className="py-4 md:py-6">
        <DataTable table={table} />
      </div>
    </>
  )
}

function CreateOrderDialog() {
  const [open, setOpen] = useState(false)
  const form = useCreateOrderForm({ setOpen })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <ClipboardPlus />
          Create New Order
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>
        <div className="no-scrollbar -mx-4 max-h-[50vh] overflow-y-auto px-4 pb-4">
          <CreateOrderForm form={form} />
        </div>
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
