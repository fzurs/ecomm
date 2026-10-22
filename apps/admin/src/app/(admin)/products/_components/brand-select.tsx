"use client"
import { useQuery } from "@tanstack/react-query"
import { BrandChoice } from "@workspace/api-client"
import { brandsListChoicesOptions } from "@workspace/api-client/query"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@workspace/ui/components/combobox"

export function BrandSelect({
  value,
  onValueChange,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxInput>, "value"> & {
  value: number | null
  onValueChange: (value: number | null) => void
}) {
  const { data: brands } = useQuery(brandsListChoicesOptions())

  const selectedBrand = brands?.find((brand) => brand.id === value) ?? null

  return (
    <Combobox
      items={brands}
      value={selectedBrand}
      onValueChange={(brand) => onValueChange(brand?.id ?? null)}
      itemToStringValue={(brand) => brand.id.toString()}
      itemToStringLabel={(brand) => brand.name}
    >
      <ComboboxInput placeholder="Assign a brand" showClear {...props} />
      <ComboboxContent>
        <ComboboxEmpty>No brands found.</ComboboxEmpty>
        <ComboboxList>
          {(brand: BrandChoice) => (
            <ComboboxItem key={brand.id} value={brand}>
              {brand.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
