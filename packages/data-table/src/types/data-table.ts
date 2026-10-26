import type {
  CellData,
  ColumnDef,
  ReactTable,
  RowData,
  TableFeatures,
} from "@tanstack/react-table"
import type { dataTableFeatures } from "../lib/features"

export type DataTableFeatures = typeof dataTableFeatures

/** The table `useDataTable` returns, for the components that receive it. */
export type DataTableInstance<TData extends RowData> = ReactTable<
  DataTableFeatures,
  TData
>

/** A column of a data table: `DataTableColumnDef<Product>[]`. */
export type DataTableColumnDef<
  TData extends RowData,
  TValue extends CellData = CellData,
> = ColumnDef<DataTableFeatures, TData, TValue>

export type ColumnAlign = "left" | "center" | "right"

declare module "@tanstack/react-table" {
  interface ColumnMeta<
    TFeatures extends TableFeatures,
    TData extends RowData,
    TValue extends CellData = CellData,
  > {
    /** Aligns the header and the cells together. */
    align?: ColumnAlign
    className?: string
    /** The column's name in menus, for a header that isn't a string. */
    label?: string
  }
}
