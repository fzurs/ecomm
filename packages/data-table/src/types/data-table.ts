import type { RowData } from "@tanstack/react-table"

export type ColumnAlign = "left" | "center" | "right"

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Aligns the header and the cells together. */
    align?: ColumnAlign
    className?: string
    /** The column's name in menus, for a header that isn't a string. */
    label?: string
  }
}
