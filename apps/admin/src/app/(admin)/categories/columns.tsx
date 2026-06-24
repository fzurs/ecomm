import { ColumnDef } from "@tanstack/react-table"
import { schemas } from "@workspace/api-client"
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
import z from "zod"
import { CategoryForm, useCategoryForm } from "./form"
import * as React from "react"

export const columns: ColumnDef<z.infer<typeof schemas.Category>>[] = [
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => <TableCellViewer item={row.original} />,
    enableHiding: false,
  },
  {
    id: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="min-w-72 text-sm text-pretty text-muted-foreground">
        {row.original.description}
      </div>
    ),
  },
]

function TableCellViewer({ item }: { item: z.infer<typeof schemas.Category> }) {
  const [open, setOpen] = React.useState(false)

  const form = useCategoryForm({ item, setOpen })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="link" size="sm">
          {item.name}
        </Button>
      </DialogTrigger>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
        </DialogHeader>
        <CategoryForm form={form} />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <form.AppForm>
            <form.SubscribeButton>Save Changes</form.SubscribeButton>
          </form.AppForm>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
