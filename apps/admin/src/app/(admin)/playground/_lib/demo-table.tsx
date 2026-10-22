import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@workspace/ui/components/badge"
import { format } from "date-fns"

/**
 * Local data for table components in the playground: one column per filter
 * variant of @workspace/data-table, so filters can be tried against all of them.
 */
export type DemoRow = {
  id: number
  name: string
  status: "active" | "draft" | "archived"
  tags: string[]
  featured: boolean
  price: number
  stock: number
  created_at: string
  released_at: string
}

export const demoRows: DemoRow[] = [
  {
    id: 1,
    name: "Auriculares Bluetooth",
    status: "active",
    tags: ["audio", "wireless"],
    featured: true,
    price: 45000,
    stock: 12,
    created_at: "2026-09-02",
    released_at: "2026-09-10",
  },
  {
    id: 2,
    name: "Teclado Mecánico",
    status: "active",
    tags: ["peripherals"],
    featured: false,
    price: 68000,
    stock: 4,
    created_at: "2026-09-15",
    released_at: "2026-09-20",
  },
  {
    id: 3,
    name: "Mouse Inalámbrico",
    status: "draft",
    tags: ["peripherals", "wireless"],
    featured: false,
    price: 18500,
    stock: 30,
    created_at: "2026-10-01",
    released_at: "2026-10-05",
  },
  {
    id: 4,
    name: "Monitor 24 Pulgadas",
    status: "active",
    tags: ["displays"],
    featured: true,
    price: 189000,
    stock: 2,
    created_at: "2026-08-20",
    released_at: "2026-08-28",
  },
  {
    id: 5,
    name: "Webcam Full HD",
    status: "archived",
    tags: ["cameras"],
    featured: false,
    price: 32000,
    stock: 0,
    created_at: "2026-07-11",
    released_at: "2026-07-15",
  },
]

const statusOptions = [
  { label: "Active", value: "active" },
  { label: "Draft", value: "draft" },
  { label: "Archived", value: "archived" },
]

const tagOptions = [
  "audio",
  "wireless",
  "peripherals",
  "displays",
  "cameras",
].map((tag) => ({ label: tag, value: tag }))

export const demoColumns = [
  {
    accessorKey: "name",
    meta: { variant: "text" },
  },
  {
    accessorKey: "status",
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.status}
      </Badge>
    ),
    meta: { variant: "select", options: statusOptions },
  },
  {
    accessorKey: "tags",
    cell: ({ row }) => row.original.tags.join(", "),
    enableSorting: false,
    meta: { variant: "multi-select", options: tagOptions },
  },
  {
    accessorKey: "featured",
    cell: ({ row }) => (row.original.featured ? "Yes" : "No"),
    meta: {
      variant: "boolean",
      options: [
        { label: "Featured", value: "true" },
        { label: "Not featured", value: "false" },
      ],
    },
  },
  {
    accessorKey: "price",
    meta: { variant: "range", className: "text-right" },
  },
  {
    accessorKey: "stock",
    meta: { variant: "number", className: "text-right" },
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => format(row.original.created_at, "LLL dd, y"),
    meta: { variant: "date-range" },
  },
  {
    accessorKey: "released_at",
    header: "Released",
    cell: ({ row }) => format(row.original.released_at, "LLL dd, y"),
    meta: { variant: "date" },
  },
] as const satisfies ColumnDef<DemoRow>[]
