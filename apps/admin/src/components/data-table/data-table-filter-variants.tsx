"use client"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
import { useQueries, useQuery, UseQueryOptions } from "@tanstack/react-query"
import { Column } from "@tanstack/react-table"
import {
  Combobox,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
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
import { TextIcon } from "lucide-react"
import { SingleParser } from "nuqs"
import * as React from "react"

export function ComboboxFilter<TData>({
  column,
  multiple,
  itemToStringLabel = (item: any) => item.label,
  itemToStringValue = (item: any) => item.value,
  value: valueProp,
  onValueChange: setValueProp,
  ...props
}: React.ComponentProps<typeof Combobox> & {
  column: Column<TData>
}) {
  const anchor = useComboboxAnchor()

  const [_value, _setValue] = React.useState<any>(multiple ? [] : null)
  const value = valueProp ?? _value
  const onValueChange = React.useCallback(
    (value: any, eventDetails: any) => {
      if (setValueProp) {
        setValueProp(value, eventDetails)
      } else {
        _setValue(value)
      }

      column.setFilterValue(
        multiple
          ? value.length
            ? value.map(itemToStringValue)
            : undefined
          : value
            ? itemToStringValue(value)
            : undefined
      )
    },
    [setValueProp, column.setFilterValue, multiple, itemToStringValue]
  )

  return (
    <Combobox
      autoHighlight
      multiple={multiple}
      itemToStringLabel={itemToStringLabel}
      itemToStringValue={itemToStringValue}
      value={value}
      onValueChange={onValueChange}
      {...props}
    >
      {multiple ? (
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {value.map((item: any) => (
              <ComboboxChip key={itemToStringValue(item)}>
                {itemToStringLabel(item)}
              </ComboboxChip>
            ))}
            <ComboboxChipsInput placeholder={column.id} />
          </ComboboxValue>
        </ComboboxChips>
      ) : (
        <ComboboxInput placeholder={column.id} showClear />
      )}
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={itemToStringValue(item)} value={item}>
              {itemToStringLabel(item)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export function AsyncComboboxFitler<TData>({
  queryOptions,
  getItemQueryOptions,
  column,
  multiple,
  itemToStringValue = (item: any) => item.value,
  parser,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxFilter<TData>>, "items"> & {
  queryOptions: UseQueryOptions<any, any, any, any>
  getItemQueryOptions: (value: any) => UseQueryOptions<any, any, any, any>
  parser: SingleParser<any>
}) {
  const [open, setOpen] = React.useState(false)

  const filterValue = column.getFilterValue() as any

  const { data: items, isFetched } = useQuery({
    ...queryOptions,
    enabled: open,
    staleTime: 60 * 5 * 1000,
  })

  const currentItemsQuery = useQueries({
    queries: (Array.isArray(filterValue) ? filterValue : [filterValue]).map(
      (v) => ({
        ...getItemQueryOptions(v),
        enabled: !isFetched && !!filterValue,
        staleTime: 60 * 5 * 1000,
      })
    ),
  })
  const currentItemsKey = currentItemsQuery.map((q) => q.data).join(",")

  const currentItems = React.useMemo(
    () => currentItemsQuery.map(({ data }) => data).filter((data) => !!data),
    // https://claude.ai/chat/01f12efc-c753-4f78-93ee-1c73d39240f1
    // Comparar por los IDs/valores reales, no por la referencia del array
    [currentItemsKey]
  )

  const itemsMap = React.useMemo<any>(() => {
    if (!items) return {}
    const map = new Map<string, any>()
    for (const item of items) {
      map.set(itemToStringValue(item), item)
    }
    return map
  }, [items])

  const value = React.useMemo(() => {
    if (!filterValue) return multiple ? [] : null

    if (isFetched) {
      if (multiple) {
        return (filterValue as string[])
          .map((v) => itemsMap.get(v))
          .filter(Boolean)
      } else {
        return itemsMap.get(filterValue as string) ?? null
      }
    } else {
      return multiple ? currentItems : currentItems[0]
    }
  }, [filterValue, itemsMap, isFetched, multiple, currentItemsKey])

  return (
    <ComboboxFilter
      multiple={multiple}
      column={column}
      items={items ?? []}
      open={open}
      onOpenChange={setOpen}
      value={value}
      itemToStringValue={itemToStringValue}
      {...props}
    />
  )
}

export function TextFilter<TData>({ column }: { column: Column<TData> }) {
  const filterValue = (column.getFilterValue() as string) ?? ""
  const [textValue, setTextValue] = React.useState(filterValue)

  const debouncedSetFilter = useDebouncedCallback(column.setFilterValue, 300)
  const onTextChange = React.useCallback(
    (value: string) => {
      setTextValue(value)
      debouncedSetFilter(value)
    },
    [setTextValue, debouncedSetFilter]
  )

  // actualizamos el estado cuando se aplique un cambio
  // en el valor por fuera de este componente
  React.useEffect(() => {
    setTextValue(filterValue)
  }, [filterValue])

  return (
    <InputGroup className="max-w-fit">
      <InputGroupInput
        placeholder={column.id}
        value={(column.getFilterValue() as string) ?? ""}
        onChange={(event) => column.setFilterValue(event.target.value)}
      />
      <InputGroupAddon>
        <TextIcon />
      </InputGroupAddon>
    </InputGroup>
  )
}

export function NewComboboxFilter({
  itemToStringLabel,
  itemToStringValue,
  items,
}: {
  itemToStringLabel: (item: any) => string
  itemToStringValue: (item: any) => string
  items: any[]
}) {
  return (
    <Combobox
      items={items}
      defaultValue={null}
      itemToStringLabel={itemToStringLabel}
      itemToStringValue={itemToStringValue}
    >
      <ComboboxInput placeholder="new filter" />
      <ComboboxContent>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={itemToStringValue(item)} value={item}>
              {itemToStringLabel(item)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
