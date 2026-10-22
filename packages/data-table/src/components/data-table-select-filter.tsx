"use client"
import { Column } from "@tanstack/react-table"
import { Option } from "../types/data-table"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@workspace/ui/components/combobox"
import React, { useMemo } from "react"

/** Filter for the `select` variant: one option, stored as its value. */
export function DataTableSelectFilter<TData>({
  column,
  title,
  options,
  ...props
}: {
  column?: Column<TData>
  title?: string
  options: Option[]
} & Pick<React.ComponentProps<typeof Combobox>, "open" | "onOpenChange">) {
  const filterValue = column?.getFilterValue()

  const value = useMemo(
    () => options.find((opt) => opt.value === filterValue) ?? null,
    [filterValue, options]
  )

  return (
    <Combobox
      {...props}
      items={options}
      value={value}
      onValueChange={(option: Option | null) =>
        column?.setFilterValue(option?.value)
      }
    >
      <ComboboxInput placeholder={title} showClear />
      <ComboboxContent>
        <ComboboxEmpty>No items.</ComboboxEmpty>
        <ComboboxList>
          {(option: Option) => (
            <ComboboxItem key={option.value} value={option}>
              {option.icon} {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
