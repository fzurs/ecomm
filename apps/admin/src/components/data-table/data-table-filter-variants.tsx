"use client"
import { useQueries, useQuery, UseQueryOptions } from "@tanstack/react-query"
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
import * as React from "react"

export function TextFilter({
  ...props
}: React.ComponentProps<typeof InputGroupInput>) {
  return (
    <InputGroup className="max-w-fit">
      <InputGroupInput {...props} />
      <InputGroupAddon>
        <TextIcon />
      </InputGroupAddon>
    </InputGroup>
  )
}

function defaultItemToLabel(item: unknown): string {
  if (item !== null && typeof item === "object" && "label" in item) {
    return String((item as { label: unknown }).label)
  }
  return defaultItemToValue(item)
}

function defaultItemToValue(item: unknown): string {
  if (item !== null && typeof item === "object" && "value" in item) {
    return String((item as { value: unknown }).value)
  }
  return typeof item === "string" ? item : JSON.stringify(item)
}

type ComboboxValueType<
  Value,
  Multiple extends boolean | undefined,
> = Multiple extends true ? Value[] : Value

type BaseProps<Value, Multiple extends boolean | undefined, FilterValue> = Omit<
  React.ComponentProps<typeof Combobox<Value, Multiple>>,
  "items"
> & {
  filterValue: ComboboxValueType<FilterValue, Multiple> | null
  onFilterChange: (
    value: ComboboxValueType<FilterValue, Multiple> | null
  ) => void
  filterValueToString?: (filterValue: FilterValue) => string
  items?: Value[]
  placeholder?: string
}

// Cuando FilterValue = Value (o no se especifica), valueToFilterValue es opcional
export function ComboboxFilter<
  Value,
  Multiple extends boolean | undefined = false,
>(
  props: BaseProps<Value, Multiple, Value> & {
    valueToFilterValue?: never
  }
): React.ReactElement

// Cuando FilterValue es distinto de Value, valueToFilterValue es requerida
export function ComboboxFilter<
  Value,
  Multiple extends boolean | undefined = false,
  FilterValue = Value,
>(
  props: BaseProps<Value, Multiple, FilterValue> & {
    valueToFilterValue: (value: Value) => FilterValue
  }
): React.ReactElement

export function ComboboxFilter<
  Value,
  Multiple extends boolean | undefined = false,
  FilterValue = Value,
>({
  multiple = false as Multiple,
  filterValue,
  onFilterChange,
  items = [],
  itemToStringLabel = defaultItemToLabel,
  itemToStringValue = defaultItemToValue,
  value: valueProp,
  onValueChange: setValueProp,
  filterValueToString = String,
  valueToFilterValue = (v) => v as never,
  placeholder,
  ...props
}: BaseProps<Value, Multiple, FilterValue> & {
  valueToFilterValue?: (value: Value) => FilterValue
}) {
  const anchor = useComboboxAnchor()

  const itemsMap = React.useMemo(() => {
    const map = new Map<string, Value>()
    items.forEach((item) => {
      map.set(itemToStringValue(item), item)
    })
    return map
  }, [])

  const defaultValue = React.useMemo<ComboboxValueType<
    Value,
    Multiple
  > | null>(() => {
    if (!filterValue || valueProp) return null

    let value = null
    if (multiple) {
      value =
        (filterValue as FilterValue[])
          .map((f) => itemsMap.get(filterValueToString(f)))
          .filter((v): v is Value => v !== undefined) || []
    } else {
      value =
        itemsMap.get(filterValueToString(filterValue as FilterValue)) || null
    }

    return value as ComboboxValueType<Value, Multiple>
  }, [])

  const [_value, _setValue] = React.useState(defaultValue)
  const value = valueProp ?? _value
  const setValue = setValueProp ?? _setValue
  const onValueChange = React.useCallback(
    (
      item:
        | ComboboxValueType<Value, Multiple>
        | (Multiple extends true ? never : null),
      event: any
    ) => {
      setValue(item, event)

      const getFilterValue = () => {
        if (multiple) {
          const values = (item as ComboboxValueType<Value, true>).map(
            valueToFilterValue
          )
          return values.length > 0 ? values : null
        }

        return item ? valueToFilterValue(item as Value) : null
      }

      onFilterChange(getFilterValue() as any)
    },
    []
  )

  const filterValueKey = multiple
    ? (filterValue as ComboboxValueType<FilterValue, true>)?.join(",") || ""
    : String(filterValue ?? "")

  React.useEffect(() => {
    if (!filterValue) setValue(null as any, {} as any)
  }, [filterValueKey])

  return (
    <Combobox
      multiple={multiple}
      autoHighlight
      items={items}
      value={value}
      onValueChange={onValueChange}
      itemToStringLabel={itemToStringLabel}
      itemToStringValue={itemToStringValue}
      isItemEqualToValue={(itemValue, value) =>
        itemToStringValue(itemValue) === itemToStringValue(value)
      }
      {...props}
    >
      {multiple ? (
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(values: Value[] | null) => (
              <React.Fragment>
                {values &&
                  (values.length > 2 
                    ? <ComboboxChip>{values.length} selected</ComboboxChip>
                    : values.map((value) => (
                        <ComboboxChip key={itemToStringValue(value)}>
                          {itemToStringLabel(value)}
                        </ComboboxChip>
                      )))}
                <ComboboxChipsInput placeholder={placeholder} />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
      ) : (
        <ComboboxInput placeholder={placeholder} showClear />
      )}
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No items found.</ComboboxEmpty>
        <ComboboxList>
          {(item: (typeof items)[number]) => (
            <ComboboxItem key={itemToStringValue(item)} value={item}>
              {itemToStringLabel(item)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

type AsyncBaseProps<
  Value,
  Multiple extends boolean | undefined,
  FilterValue,
> = Omit<BaseProps<Value, Multiple, FilterValue>, "items"> & {
  itemsQueryOptions: UseQueryOptions<any, any, Value[], any>
  getItemQueryOptions: (
    f: NoInfer<NonNullable<FilterValue>>
  ) => UseQueryOptions<any, any, Value, any>
}

// Cuando FilterValue = Value (o no se especifica), valueToFilterValue es opcional
export function AsyncComboboxFilter<
  Value,
  Multiple extends boolean | undefined = false,
>(
  props: AsyncBaseProps<Value, Multiple, Value> & {
    valueToFilterValue?: never
  }
): React.ReactElement

// Cuando FilterValue es distinto de Value, valueToFilterValue es requerida
export function AsyncComboboxFilter<
  Value,
  Multiple extends boolean | undefined = false,
  FilterValue = Value,
>(
  props: AsyncBaseProps<Value, Multiple, FilterValue> & {
    valueToFilterValue: (value: Value) => FilterValue
  }
): React.ReactElement

export function AsyncComboboxFilter<
  Value,
  Multiple extends boolean | undefined = false,
  FilterValue = Value,
>({
  filterValue,
  multiple = false as Multiple,
  itemsQueryOptions,
  getItemQueryOptions,
  valueToFilterValue,
  ...props
}: AsyncBaseProps<Value, Multiple, FilterValue> & {
  valueToFilterValue?: (value: Value) => FilterValue
}) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState<ComboboxValueType<
    Value,
    Multiple
  > | null>(null)

  const { data: items, isSuccess } = useQuery({
    ...itemsQueryOptions,
    enabled: open,
  })

  const filterValues = filterValue
    ? multiple
      ? (filterValue as FilterValue[])
      : [filterValue as FilterValue]
    : []
  const currentItemsQuery = useQueries({
    queries: filterValues.map((f) => ({
      ...getItemQueryOptions(f as NonNullable<FilterValue>),
      enabled: !isSuccess,
    })),
  })
  const currentItemsData = currentItemsQuery.map((q) => q.data)
  const currentItemsKey = currentItemsData.join(",")
  const currentItems = React.useMemo<Value[]>(
    () => currentItemsData.filter((v) => v !== undefined),
    [currentItemsKey]
  )

  React.useEffect(() => {
    if (!isSuccess) {
      setValue(
        (multiple
          ? currentItems
          : currentItems[0] || null) as ComboboxValueType<
          Value,
          Multiple
        > | null
      )
    }
  }, [currentItemsKey])

  return (
    <ComboboxFilter<Value, Multiple, FilterValue>
      multiple={multiple}
      items={items}
      filterValue={filterValue}
      open={open}
      onOpenChange={setOpen}
      value={value}
      onValueChange={setValue}
      valueToFilterValue={valueToFilterValue as never}
      {...props}
    />
  )
}
