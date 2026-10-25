"use client"
import { Column } from "@tanstack/react-table"
import { Order } from "@workspace/api-client"
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
import { cn } from "cn"
import { useMemo } from "react"
import { orderStatusClasses, orderStatusOptions } from "../_lib/order-status"

type StatusOption = (typeof orderStatusOptions)[number]

/**
 * DataTableMultiSelectFilter for the order status: the chips look like the status badges
 * and the items are colored like them, as in OrderStatusRadioGroup.
 */
export function OrderStatusFilter({ column }: { column?: Column<Order> }) {
  const anchor = useComboboxAnchor()

  const filterValue = column?.getFilterValue()

  const value = useMemo(() => {
    if (!Array.isArray(filterValue)) return []
    return filterValue
      .map((value) => orderStatusOptions.find((opt) => opt.value === value))
      .filter((opt) => opt !== undefined)
  }, [filterValue])

  return (
    <Combobox
      multiple
      items={orderStatusOptions}
      value={value}
      onValueChange={(options: StatusOption[]) =>
        column?.setFilterValue(
          options.length > 0 ? options.map((opt) => opt.value) : undefined
        )
      }
    >
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(values: StatusOption[]) => (
            <>
              {values.length > 3 ? (
                <ComboboxChip>{values.length} selected</ComboboxChip>
              ) : (
                values.map((opt) => (
                  <ComboboxChip
                    key={opt.value}
                    className={orderStatusClasses[opt.value].badge}
                  >
                    {opt.label}
                  </ComboboxChip>
                ))
              )}
              <ComboboxChipsInput placeholder="Filter by Status" />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No items.</ComboboxEmpty>
        <ComboboxList>
          {(option: StatusOption) => (
            <ComboboxItem
              key={option.value}
              value={option}
              className={cn(
                orderStatusClasses[option.value].badge,
                orderStatusClasses[option.value].highlight,
                "bg-transparent dark:bg-transparent"
              )}
            >
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
