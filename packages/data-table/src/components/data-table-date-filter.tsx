import { Column } from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
import { ButtonGroup } from "@workspace/ui/components/button-group"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"
import { format } from "date-fns"
import { CalendarIcon, XIcon } from "lucide-react"
import { useCallback, useMemo } from "react"
import { DateRange } from "react-day-picker"

function formatDate(date: Date) {
  return format(date, "LLL dd, y")
}

type DataTableDateFilterProps<TData> = { column: Column<TData>; title?: string }

export function DataTableDateFilter<TData>({
  column,
  title,
}: DataTableDateFilterProps<TData>) {
  const filterValue = column.getFilterValue()

  const selected = useMemo<DateRange>(() => {
    if (!Array.isArray(filterValue)) return { from: undefined }
    return { from: filterValue[0], to: filterValue[1] }
  }, [filterValue])

  const onSelect = (dates?: DateRange) =>
    column.setFilterValue(dates ? [dates.from, dates.to] : undefined)

  const onRender = useCallback(() => {
    if (!selected.from) return <span>{title}</span>
    if (!selected.to) return formatDate(selected.from)
    return `${formatDate(selected.from)} - ${formatDate(selected.to)}`
  }, [selected, title])

  const onClear = () => column.setFilterValue(undefined)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <ButtonGroup>
          <Button
            variant="outline"
            id="date-picker-range"
            className={cn(
              "justify-start px-2.5 font-normal",
              !selected.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {onRender()}
          </Button>
          {selected.from && (
            <Button variant="outline" size="icon" onClick={onClear}>
              <XIcon />
            </Button>
          )}
        </ButtonGroup>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={selected?.from}
          selected={selected}
          onSelect={onSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
}
