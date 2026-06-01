import { UseQueryOptions } from "@tanstack/react-query"
import type { RowData } from "@tanstack/react-table"
import { SingleParser } from "nuqs"

export type Option<T = unknown> = {
  label: string
  value: T
  icon?: React.ReactNode
}

export type FilterOpts =
  | { variant: "text"; parser: SingleParser<string> }
  | {
      variant: "boolean"
      parser: SingleParser<boolean>
      options: Option<boolean>[]
    }
  | {
      variant: "select"
      parser: SingleParser<any>
      options: Option[]
    }
  | {
      variant: "multi-select"
      parser: SingleParser<any[]>
      options: Option[]
    }
  | {
      variant: "async-select"
      parser: SingleParser<any>
      options: UseQueryOptions<any, any, Option[], any>
    }
  | {
      variant: "async-multi"
      parser: SingleParser<any[]>
      options: UseQueryOptions<any, any, Option[], any>
    }

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData = RowData> {
    isPending?: boolean
  }

  interface ColumnMeta<TData extends RowData, TValue> {
    filter?: FilterOpts & { placeholder?: string }
  }
}
