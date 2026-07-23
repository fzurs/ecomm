"use client"
import { DataTable } from "@/components/data-table/data-table"
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderHeading,
} from "@/components/page-header"
import { useDataTable } from "@/hooks/use-data-table"
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
import * as React from "react"
import { usePaginationValues } from "@/hooks/use-pagination"
import { brandsListOptions } from "@workspace/api-client/query"
import {
  AppHeader,
  AppHeaderActions,
  AppHeaderContent,
  AppHeaderSeparator,
} from "@/components/app-header"
import { AppSidebarTrigger } from "@/components/app-sidebar"
import { NavBreadcrumb } from "@/components/nav-breadcrumb"
import {
  Section,
  SectionContent,
  SectionGroup,
  SectionHeader,
  SectionTitle,
} from "@/components/section"

export default function BrandsPage() {
  const pagination = usePaginationValues()

  const { data } = useQuery({
    ...brandsListOptions({ query: pagination }),
    placeholderData: keepPreviousData,
  })

  const table = useDataTable({ data, columns })

  return (
    <>
      <AppHeader>
        <AppHeaderContent>
          <AppSidebarTrigger />
          <AppHeaderSeparator />
          <NavBreadcrumb items={[{ type: "page", label: "Brands" }]} />
        </AppHeaderContent>
        <AppHeaderActions>
          <QuickCreateBrandDialog />
        </AppHeaderActions>
      </AppHeader>
      <SectionGroup>
        <Section>
          <SectionHeader>
            <SectionTitle>Brands</SectionTitle>
          </SectionHeader>
          <SectionContent>
            <DataTable table={table} showToolbar={false} />
          </SectionContent>
        </Section>
      </SectionGroup>
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
            <form.Submit>Create</form.Submit>
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
