"use client"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { Combobox } from "@workspace/ui/components/combobox"
import React from "react"

export function ComboboxQueryOnOpenById({
  itemsQueryOptions,
  value: itemId,
  onValueChange: setItemId,
  initialItem,
  ...props
}: Omit<
  React.ComponentProps<typeof Combobox<{ id: number; name: string }, false>>,
  "items" | "value" | "onValueChange"
> & {
  itemsQueryOptions: UseQueryOptions<
    any,
    any,
    { id: number; name: string }[],
    any
  >
  value: number | null
  onValueChange: (value: number | null) => void
  initialItem?: { id: number; name: string } | null
}) {
  const [open, setOpen] = React.useState(false)

  const { data: items } = useQuery(itemsQueryOptions)

  const selectedItem =
    items?.find((item) => item.id === itemId) ||
    (initialItem?.id === itemId && initialItem) ||
    null

  return (
    <Combobox
      autoHighlight
      items={items}
      open={open}
      onOpenChange={setOpen}
      value={selectedItem}
      onValueChange={(value) => setItemId(value?.id ?? null)}
      itemToStringLabel={(item) => item.name}
      itemToStringValue={(item) => item.id.toString()}
      isItemEqualToValue={(itemValue, value) => itemValue.id === value.id}
      {...props}
    />
  )
}
