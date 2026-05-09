"use client"
import { dataTableConfig } from "@/config/data-table"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
import { useQuery } from "@tanstack/react-query"
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
import * as React from "react"

type Option = Record<"label" | "value", string>

export function ComboboxFilter<TData>({
  column,
  multiple,
  options,
  ...props
}: Omit<React.ComponentProps<typeof Combobox>, "items"> & {
  column: Column<TData>
  options: Option[]
}) {
  const anchor = useComboboxAnchor()
  // controlled state
  const [value, setValue] = React.useState<Option[] | Option | null>(
    multiple ? [] : null
  )

  const filterValue = column.getFilterValue()
  React.useEffect(() => {
    if (
      !filterValue ||
      (Array.isArray(filterValue) && filterValue.length === 0)
    )
      setValue(multiple ? [] : null)
  }, [multiple, setValue, filterValue])

  return (
    <Combobox
      autoHighlight
      multiple={multiple}
      items={options}
      value={value}
      onValueChange={(value) => {
        setValue(value as any)
        // convertimos el item: Option en un string | string[]
        column.setFilterValue(
          Array.isArray(value)
            ? value.length > 0
              ? (value as Option[]).map((option) => option.value)
              : null
            : value !== null
              ? (value as Option).value
              : null
        )
      }}
      {...props}
    >
      {multiple ? (
        <ComboboxChips ref={anchor}>
          <ComboboxValue>
            {(values: Option[]) => (
              <React.Fragment>
                {values.map((option) => (
                  <ComboboxChip key={option.value}>{option.label}</ComboboxChip>
                ))}
                <ComboboxChipsInput placeholder={column.id} />
              </React.Fragment>
            )}
          </ComboboxValue>
        </ComboboxChips>
      ) : (
        <ComboboxInput placeholder={column.id} showClear />
      )}
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No options found.</ComboboxEmpty>
        <ComboboxList>
          {(option: Option) => (
            <ComboboxItem key={option.value} value={option}>
              {option.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

export function AsyncComboboxFitler<TData>({
  source,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxFilter<TData>>, "options"> & {
  source: keyof typeof dataTableConfig.dataSources
}) {
  const [open, setOpen] = React.useState(false)

  const { data: options } = useQuery({
    ...dataTableConfig.dataSources[source],
    enabled: open,
    staleTime: 60 * 5 * 1000,
  })

  return (
    <ComboboxFilter
      options={options ?? []}
      open={open}
      onOpenChange={setOpen}
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
        value={textValue}
        onChange={(event) => onTextChange(event.target.value)}
      />
      <InputGroupAddon>
        <TextIcon />
      </InputGroupAddon>
    </InputGroup>
  )
}
