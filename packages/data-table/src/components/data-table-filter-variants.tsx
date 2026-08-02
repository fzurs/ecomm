"use client"
import * as React from "react"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@workspace/ui/components/input-group"
import { Separator } from "@workspace/ui/components/separator"
import { CalendarIcon, XIcon } from "lucide-react"
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
import { Input } from "@workspace/ui/components/input"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@workspace/ui/components/combobox"
import { Option } from "../types.data-table"
import { Column } from "@tanstack/react-table"
import { useMemo } from "react"
import { cn } from "@workspace/ui/lib/utils"

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function getColumnLabel<TData>(column: Column<TData>) {
  if (typeof column.columnDef.header === "string") {
    return column.columnDef.header
  }
  return capitalize(column.id.replaceAll("_", " "))
}

const onNumberChange = (setValue: (val: number) => void) => {
  return (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) =>
    setValue(Number(e.target.value))
}

export function TextFilter({ column }: { column: Column<any> }) {
  return (
    <Input
      value={(column.getFilterValue() as string) ?? ""}
      onChange={(e) => column.setFilterValue(e.target.value)}
      placeholder={getColumnLabel(column)}
    />
  )
}

export function NumberFilter({ column }: { column: Column<any> }) {
  return (
    <Input
      type="number"
      inputMode="numeric"
      min={0}
      className="w-full"
      value={(column.getFilterValue() as string) ?? ""}
      onChange={(e) => {
        column.setFilterValue(e.target.value)
      }}
      placeholder={getColumnLabel(column)}
    />
  )
}

export function BooleanFilter<TData>({ column }: { column: Column<TData> }) {
  const options = column.columnDef.meta?.options ?? []
  return (
    <ToggleGroup
      className="text-muted-foreground"
      variant="outline"
      type="single"
      value={String(column.getFilterValue())}
      onValueChange={(val) =>
        column.setFilterValue(
          val === "true" ? true : val === "false" ? false : null
        )
      }
    >
      {options.slice(0, 2).map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          aria-label={`Toggle ${option.label}`}
        >
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}

export function RangeFilter<TData>({ column }: { column: Column<TData> }) {
  const range = (column.getFilterValue() as number[]) ?? []
  const setRange = column.setFilterValue
  const placeholder = getColumnLabel(column)

  const [minValue = 0, maxValue] = range

  const setMinValue = React.useCallback(
    (value: number) =>
      setRange(
        value
          ? maxValue
            ? [value, maxValue]
            : [value]
          : maxValue
            ? [0, maxValue]
            : null
      ),
    [maxValue, setRange]
  )

  const setMaxValue = React.useCallback(
    (value: number) =>
      setRange(
        value
          ? minValue
            ? [minValue, value]
            : [0, value]
          : minValue
            ? [minValue]
            : null
      ),
    [minValue, setRange]
  )

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
        onChange={onNumberChange(setMinValue)}
      />
      <Separator orientation="vertical" />
      <InputGroupInput
        placeholder="Max"
        className="max-w-14"
        value={maxValue ?? ""}
        onChange={onNumberChange(setMaxValue)}
      />
      {(minValue || maxValue) && (
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

export function DateRangeFilter<TData>({ column }: { column: Column<TData> }) {
  const range = (column.getFilterValue() as Date[]) ?? []
  const setRange = column.setFilterValue
  const placeholder = getColumnLabel(column)
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
            className={cn(
              "justify-start px-2.5 font-normal",
              !date.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {date.from ? (
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

function SelectFilterContent({
  ...props
}: React.ComponentProps<typeof ComboboxContent>) {
  return (
    <ComboboxContent {...props}>
      <ComboboxList>
        {(option: Option) => (
          <ComboboxItem key={option.value} value={option}>
            {option.label}
          </ComboboxItem>
        )}
      </ComboboxList>
    </ComboboxContent>
  )
}

export function SelectFilter<TData>({ column }: { column: Column<TData> }) {
  const options = column.columnDef.meta?.options ?? []
  const label = getColumnLabel(column)
  const value: Option | null =
    options.find((opt) => opt.value === column.getFilterValue()) ?? null
  const onValueChange = (opt: Option | null) =>
    column.setFilterValue(opt?.value)

  return (
    <Combobox<Option, false>
      items={options}
      value={value}
      onValueChange={onValueChange}
    >
      <ComboboxInput placeholder={label} showClear />
      <SelectFilterContent />
    </Combobox>
  )
}

export function MultiSelectFilter<TData>({
  column,
}: {
  column: Column<TData>
}) {
  const anchor = useComboboxAnchor()

  const options = column.columnDef.meta?.options ?? []
  const label = getColumnLabel(column)

  const filterValue = (column.getFilterValue() as string[]) ?? []
  const value = useMemo<Option[]>(
    () =>
      filterValue
        .map((value) => options.find((opt) => opt.value === value))
        .filter((opt) => opt !== undefined),
    [filterValue]
  )

  const onValueChange = (opts: Option[]) =>
    column.setFilterValue(
      opts.length > 0 ? opts.map((opt) => opt.value) : undefined
    )

  return (
    <Combobox<Option, true>
      multiple
      items={options}
      value={value}
      onValueChange={onValueChange}
    >
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(values: Option[]) => (
            <>
              {values.length > 3 ? (
                <ComboboxChip>{values.length} selected</ComboboxChip>
              ) : (
                values.map((opt) => (
                  <ComboboxChip key={opt.value}>{opt.label}</ComboboxChip>
                ))
              )}
              <ComboboxChipsInput placeholder={label} />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <SelectFilterContent anchor={anchor} />
    </Combobox>
  )
}
