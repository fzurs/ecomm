import type { RowData } from "@tanstack/react-table"
import { FilterVariant } from "./core/default-parsers"

export type Option = Record<"label" | "value", string>

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData = RowData> {
    isPending?: boolean
  }

  interface ColumnMeta<TData extends RowData, TValue> {
    thClassName?: string
    className?: string
    variant?: FilterVariant
    options?: Option[]
  }
}
