import { ColumnDef } from "@tanstack/react-table"
import { schemas } from "@workspace/api-client"
import z from "zod"

export const columns: ColumnDef<z.infer<typeof schemas.Category>>[] = [
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-semibold">{row.original.name}</div>,
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
