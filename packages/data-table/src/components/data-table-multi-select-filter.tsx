"use client"
import { Column } from "@tanstack/react-table"
import { Option } from "../types/data-table"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@workspace/ui/components/combobox"
import React, { useMemo } from "react"

/** Filter for the `multi-select` variant: several options, stored as values. */
export function DataTableMultiSelectFilter<TData>({
  column,
  title,
  options,
  ...props
}: {
  column?: Column<TData>
  title?: string
  options: Option[]
} & Pick<React.ComponentProps<typeof Combobox>, "open" | "onOpenChange">) {
  const anchor = useComboboxAnchor()

  const filterValue = column?.getFilterValue()

  const value = useMemo(() => {
    if (!Array.isArray(filterValue)) return []
    return filterValue
      .map((value) => options.find((opt) => opt.value === value))
      .filter((opt) => opt !== undefined)
  }, [filterValue, options])

  return (
    <Combobox
      {...props}
      multiple
      items={options}
      value={value}
      onValueChange={(options: Option[]) =>
        column?.setFilterValue(
          options.length > 0 ? options.map((opt) => opt.value) : undefined
        )
      }
    >
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(values: Option[]) => (
            <>
              {values.length > 3 ? (
                <ComboboxChip>{values.length} selected</ComboboxChip>
              ) : (
                values.map((opt) => (
                  <ComboboxChip key={opt.value} className="[&_svg]:size-3.5">
                    {opt.icon} {opt.label}
                  </ComboboxChip>
                ))
              )}
              <ComboboxChipsInput placeholder={title} />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
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
