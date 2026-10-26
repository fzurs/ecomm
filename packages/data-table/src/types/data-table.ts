import type { RowData } from "@tanstack/react-table"

export type ColumnAlign = "left" | "center" | "right"

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData = RowData> {
    isPending?: boolean
  }

  interface ColumnMeta<TData extends RowData, TValue> {
    /** Aligns the header and the cells together. */
    align?: ColumnAlign
    className?: string
  }
}
