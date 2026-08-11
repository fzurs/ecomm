import { Column } from "@tanstack/react-table"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@workspace/ui/components/input-group"
import { Separator } from "@workspace/ui/components/separator"
import { XIcon } from "lucide-react"
import { useCallback, useMemo } from "react"

export function DataTableRangeFilter<TData>({
  column,
  title,
}: {
  column: Column<TData>
  title?: string
}) {
  const filterValue = column.getFilterValue()

  const selected = useMemo<{ min?: number; max?: number }>(() => {
    if (!Array.isArray(filterValue)) return {}
    return { min: filterValue[0], max: filterValue[1] }
  }, [filterValue])

  const onMinValueChange = useCallback(
    (value: number) => {
      if (!value) {
        column.setFilterValue(selected.max ? [0, selected.max] : null)
        return
      }

      column.setFilterValue(selected.max ? [value, selected.max] : [value])
    },
    [column, selected.max]
  )

  const onMaxValueChange = useCallback(
    (value: number) => {
      if (!value) {
        column.setFilterValue(selected.min ? [selected.min] : null)
        return
      }

      column.setFilterValue(selected.min ? [selected.min, value] : [0, value])
    },
    [column, selected.min]
  )

  const onClear = () => column.setFilterValue(undefined)

  return (
    <InputGroup className="w-auto">
      <InputGroupAddon className="pe-3">
        <InputGroupText>{title}</InputGroupText>
      </InputGroupAddon>
      <Separator orientation="vertical" />
      <InputGroupInput
        type="number"
        inputMode="numeric"
        placeholder="Min"
        className="max-w-16"
        value={selected.min ?? ""}
        onChange={(e) => onMinValueChange(Number(e.target.value))}
        min={0}
      />
      <Separator orientation="vertical" />
      <InputGroupInput
        type="number"
        inputMode="numeric"
        placeholder="Max"
        className="max-w-16"
        value={selected.max ?? ""}
        onChange={(e) => onMaxValueChange(Number(e.target.value))}
        min={0}
      />
      {(selected.min || selected.max) && (
        <>
          <Separator orientation="vertical" />
          <InputGroupAddon align="inline-end" className="ps-1">
            <InputGroupButton size="icon-xs" onClick={onClear}>
              <XIcon />
            </InputGroupButton>
          </InputGroupAddon>
        </>
      )}
    </InputGroup>
  )
}
