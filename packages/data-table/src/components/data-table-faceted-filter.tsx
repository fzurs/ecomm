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
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@workspace/ui/components/combobox"
import React, { useCallback, useMemo } from "react"

type DataTableFacetedFilterProps<TData> = {
  column?: Column<TData>
  title?: string
  multiple?: boolean
  options: Option[]
} & Pick<React.ComponentProps<typeof Combobox>, "open" | "onOpenChange">

export function DataTableFacetedFilter<TData>({
  column,
  title,
  multiple,
  options,
  ...props
}: DataTableFacetedFilterProps<TData>) {
  const anchor = useComboboxAnchor()

  const filterValue = column?.getFilterValue()

  const value = useMemo<Option[] | Option | null>(() => {
    if (multiple) {
      if (!Array.isArray(filterValue)) return []
      return filterValue
        .map((value) => options.find((opt) => opt.value === value))
        .filter((opt) => opt !== undefined)
    }
    return options.find((opt) => opt.value === filterValue) || null
  }, [filterValue, multiple, options])

  const onValueChange = useCallback(
    (values: Option[] | Option | null) => {
      if (multiple) {
        const opts = values as Option[]
        return column?.setFilterValue(
          opts.length > 0 ? opts.map((opt) => opt.value) : undefined
        )
      }
      return column?.setFilterValue(values ?? undefined)
    },
    [column, multiple]
  )

  return (
    <Combobox
      {...props}
      multiple={multiple}
      items={options}
      value={value}
      onValueChange={onValueChange}
    >
      {multiple ? (
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
      ) : (
        <ComboboxInput placeholder={title} showClear />
      )}
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
