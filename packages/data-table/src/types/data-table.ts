import type { RowData } from "@tanstack/react-table"
import { UseQueryOptions } from "@tanstack/react-query"
import { dataTableConfig } from "../config/data-table"

export type FilterParsers = typeof dataTableConfig.filterParsers
export type FilterVariant = keyof FilterParsers

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
    thClassName?: string
    className?: string
    variant?: FilterVariant
    options?: Option[]
    queryOptions?: UseQueryOptions<any, any, any, any>
    itemToLabel?: (item: any) => string
    itemToValue?: (item: any) => string
  }
}
