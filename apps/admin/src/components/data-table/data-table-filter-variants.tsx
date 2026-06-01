"use client"
import { toNullIfEmpty } from "@/lib/utils"
import { type Option } from "@/types/data-table"
import { IconSearch } from "@tabler/icons-react"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
  ComboboxValue,
  useComboboxAnchor,
} from "@workspace/ui/components/combobox"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import * as React from "react"

export function TextFilter({
  ...props
}: React.ComponentProps<typeof InputGroupInput>) {
  return (
    <InputGroup className="w-auto">
      <InputGroupInput {...props} />
      <InputGroupAddon>
        <IconSearch />
      </InputGroupAddon>
    </InputGroup>
  )
}

export function ComboboxFilter<
  Value,
  Multiple extends boolean | undefined = false,
>({
  multiple,
  items = [],
  placeholder,
  ...props
}: Omit<React.ComponentProps<typeof Combobox<Value, Multiple>>, "items"> & {
  items?: Option[]
  placeholder?: string
}) {
  const anchor = useComboboxAnchor()

  return (
    <Combobox multiple={multiple} items={items} {...props}>
      {multiple ? (
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(values) => {
              const selectedItems = items.filter((item) =>
                values.includes(item.value)
              )
              return (
                <React.Fragment>
                  {selectedItems.length > 2 ? (
                    <ComboboxChip showRemove={false}>
                      {selectedItems.length} selected
                    </ComboboxChip>
                  ) : (
                    selectedItems.map((item) => (
                      <ComboboxChip
                        key={String(item.value)}
                        className="[&>svg]:size-3.5"
                      >
                        {item.icon} {item.label}
                      </ComboboxChip>
                    ))
                  )}
                  <ComboboxChipsInput placeholder={placeholder} />
                </React.Fragment>
              )
            }}
          </ComboboxValue>
        </ComboboxChips>
      ) : (
        <ComboboxValue>
          {(value) => {
            const item = items?.find((item) => item.value === value)
            return (
              <ComboboxInput
                value={item?.label ?? ""}
                placeholder={placeholder}
                showClear
              >
                {item?.icon && <InputGroupAddon>{item.icon}</InputGroupAddon>}
              </ComboboxInput>
            )
          }}
        </ComboboxValue>
      )}
      <ComboboxContent anchor={anchor}>
        <ComboboxList>
          {(item: Option) => (
            <ComboboxItem key={String(item.value)} value={item.value}>
              {item.icon} {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export function AsyncComboboxFilter<
  Value,
  Multiple extends boolean | undefined = false,
>({
  itemsQueryOptions,
  value,
  ...props
}: Omit<
  React.ComponentProps<typeof ComboboxFilter<Value, Multiple>>,
  "items"
> & { itemsQueryOptions: UseQueryOptions<any, any, Option[], any> }) {
  const [open, setOpen] = React.useState(false)

  const valueIsNull = React.useMemo(
    () => toNullIfEmpty(value) !== null,
    [value]
  )

  const { data: items } = useQuery({
    ...itemsQueryOptions,
    enabled: open || valueIsNull,
  })

  return (
    <ComboboxFilter
      items={items}
      value={value}
      open={open}
      onOpenChange={setOpen}
      {...props}
    />
  )
}
