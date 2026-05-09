import type { RowData } from "@tanstack/react-table"
import { SingleParser } from "nuqs"

declare module "@tanstack/react-table" {
  // biome-ignore lint/correctness/noUnusedVariables: TData is used in the TableMeta interface
  interface TableMeta<TData extends RowData = RowData> {
    isPending?: boolean
  }

  // biome-ignore lint/correctness/noUnusedVariables: TValue is used in the ColumnMeta interface
  interface ColumnMeta<TData extends RowData, TValue> {
    filter?: (
      | {
          variant: "async-multi-select" | "async-select"
          dataSource: "categories"
        }
      | {
          variant: "multi-select" | "select"
          options: Record<"label" | "value", string>[]
        }
      | { variant: "text" }
    ) & {
      parser: SingleParser<any>
    }
  }
}
