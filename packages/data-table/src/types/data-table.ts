import type { RowData } from "@tanstack/react-table"
import { dataTableConfig } from "../config/data-table"

export type FilterParsers = typeof dataTableConfig.filterParsers
export type FilterVariant = keyof FilterParsers

export type ColumnAlign = "left" | "center" | "right"

export type Option = {
  label: string
  value: string
  icon?: React.JSX.Element
}

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData = RowData> {
    isPending?: boolean
  }

  interface ColumnMeta<TData extends RowData, TValue> {
    /** Aligns the header and the cells together. */
    align?: ColumnAlign
    className?: string
    variant?: FilterVariant
    options?: Option[]
  }
}
