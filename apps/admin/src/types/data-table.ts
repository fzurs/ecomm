import { UseQueryOptions } from "@tanstack/react-query"
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
          queryOptions: UseQueryOptions<any, any, any, any>
          getItemQueryOptions: (
            filterValue: any
          ) => UseQueryOptions<any, any, any, any>
          itemToStringLabel: (item: any) => string
          itemToStringValue: (item: any) => string
          isItemEqualToValue: (itemValue: any, value: any) => boolean
        }
      | {
          variant: "multi-select" | "select"
          options: Record<"label" | "value", string>[]
        }
      | { variant: "text" }
      | {
          variant: "combobox"
          items: any
          itemToStringLabel: (item: any) => string
          itemToStringValue: (item: any) => string
        }
    ) & {
      parser: SingleParser<any>
    }
  }
}
