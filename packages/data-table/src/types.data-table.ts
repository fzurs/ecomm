import type { RowData } from "@tanstack/react-table"
import { FilterVariant } from "./core/default-parsers"
import React from "react"
import { UseQueryOptions } from "@tanstack/react-query"

export type Option = Record<"label" | "value", string> & {
  icon?: React.JSX.Element
}

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData = RowData> {
    isPending?: boolean
  }

  interface ColumnMeta<TData extends RowData, TValue> {
    thClassName?: string
    className?: string
    variant?: FilterVariant
    options?: Option[]
    queryOptions?: UseQueryOptions<any, any, any, any>
    itemToLabel?: (item: any) => string
    itemToValue?: (item: any) => string
  }
}
