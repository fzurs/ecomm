"use client"
import { Province } from "@workspace/api-client"
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
import * as React from "react"
import { provinceOptions, provinces } from "@/lib/provinces"

const codes = provinceOptions.map((option) => option.value)

/** Several provinces, as removable chips, searched by name. */
export function ProvinceMultiSelect({
  value,
  onValueChange,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxChipsInput>, "value"> & {
  value: Province[]
  onValueChange: (value: Province[]) => void
}) {
  const anchor = useComboboxAnchor()

  return (
    <Combobox
      multiple
      autoHighlight
      items={codes}
      value={value}
      onValueChange={onValueChange}
      itemToStringLabel={(code: Province) => provinces[code]}
    >
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(selected: Province[]) => (
            <>
              {selected.map((code) => (
                <ComboboxChip key={code}>{provinces[code]}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder={selected.length ? undefined : "Add provinces"}
                {...props}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No provinces found.</ComboboxEmpty>
        <ComboboxList>
          {(code: Province) => (
            <ComboboxItem key={code} value={code}>
              {provinces[code]}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
