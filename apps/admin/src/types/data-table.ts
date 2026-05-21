import type { RowData } from "@tanstack/react-table"
import { SingleParser } from "nuqs"

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData = RowData> {
    isPending?: boolean
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filter?: {
      variant: "text" | "categories" | "statuses" | "brands" | "featured"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      parser: SingleParser<any>
    }
  }
}
