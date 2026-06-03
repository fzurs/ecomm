"use client"
import { toNullIfEmpty } from "@/lib/utils"
import { type Option } from "@/types/data-table"
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
import * as React from "react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@workspace/ui/components/input-group"
import { Separator } from "@workspace/ui/components/separator"
import { CalendarIcon, X, XIcon } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import { format } from "date-fns"
import { ButtonGroup } from "@workspace/ui/components/button-group"
import { DateRange } from "react-day-picker"

export function RangeFilter({
  range,
  setRange,
  placeholder = "Range",
}: {
  range: number[]
  setRange: (val: number[] | null) => void
  placeholder?: string
}) {
  const minValue = range[0] ?? 0
  const maxValue = range[1]

  return (
    <InputGroup className="w-auto">
      <InputGroupAddon className="pe-3">
        <InputGroupText>{placeholder}</InputGroupText>
      </InputGroupAddon>
      <Separator orientation="vertical" />
      <InputGroupInput
        placeholder="Min"
        className="max-w-14"
        value={minValue ? minValue : ""}
        onChange={(e) => {
          const value = Number(e.target.value)
          setRange(maxValue ? [value, maxValue] : [value])
        }}
      />
      <Separator orientation="vertical" />
      <InputGroupInput
        placeholder="Max"
        className="max-w-14"
        value={maxValue ?? ""}
        onChange={(e) => {
          const value = Number(e.target.value)
          setRange(value ? [minValue, value] : [minValue])
        }}
      />
      {!!range.length && (
        <>
          <Separator orientation="vertical" />
          <InputGroupAddon align="inline-end" className="ps-1">
            <InputGroupButton size="icon-xs" onClick={() => setRange(null)}>
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </>
      )}
    </InputGroup>
  )
}

export function DateRangeFilter({
  range,
  setRange,
  placeholder = "Date Range",
}: {
  range: Date[]
  setRange: (val: Date[] | null) => void
  placeholder?: string
}) {
  const date = { from: range[0], to: range[1] }
  const setDate = (selected: DateRange | undefined) =>
    setRange([selected?.from, selected?.to].filter(Boolean) as Date[])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <ButtonGroup>
          <Button
            variant="outline"
            id="date-picker-range"
            className="justify-start px-2.5 font-normal"
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
          {date.from && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => setRange(null)}
            >
              <XIcon />
            </Button>
          )}
        </ButtonGroup>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={date?.from}
          selected={date}
          onSelect={setDate}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
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
                showTrigger={false}
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
  items: itemsQueryOptions,
  value,
  ...props
}: Omit<
  React.ComponentProps<typeof ComboboxFilter<Value, Multiple>>,
  "items"
> & { items: UseQueryOptions<any, any, Option[], any> }) {
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
