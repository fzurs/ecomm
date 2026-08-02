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
import { useDataTable, usePagination } from "@workspace/data-table"
import { DataTable } from "@workspace/data-table/components/data-table"

export default function CustomersPage() {
  const pagination = usePagination()

  const { data } = useQuery({
    ...customersListOptions({ query: pagination }),
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
        <DataTable table={table} showToolbar={false} />
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
