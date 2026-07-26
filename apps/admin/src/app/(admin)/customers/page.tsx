"use client"
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderContent,
  AppHeaderSeparator,
  AppHeaderSidebarTrigger,
} from "@/components/app-header"
import { DataTable } from "@/components/data-table/data-table"
import { NavBreadcrumb } from "@/components/nav-breadcrumb"
import {
  Section,
  SectionContent,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from "@/components/section"
import { useDataTable } from "@/hooks/use-data-table"
import { usePaginationValues } from "@/hooks/use-pagination"
import { useQuery } from "@tanstack/react-query"
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

export default function CustomersPage() {
  const pagination = usePaginationValues()

  const { data } = useQuery(customersListOptions({ query: pagination }))

  const table = useDataTable({ data, columns })

  return (
    <>
      <AppHeader>
        <AppHeaderContent>
          <AppHeaderSidebarTrigger />
          <AppHeaderSeparator />
          <NavBreadcrumb items={[{ type: "page", label: "Customers" }]} />
        </AppHeaderContent>
        <AppHeaderActions><CreateCustomerDialog /></AppHeaderActions>
      </AppHeader>
      <SectionGroup>
        <Section>
          <SectionHeader>
            <SectionTitle>Customers</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <DataTable table={table} />
          </SectionContent>
        </Section>
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
