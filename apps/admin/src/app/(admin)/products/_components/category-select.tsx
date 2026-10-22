"use client"
import { useQuery } from "@tanstack/react-query"
import { CategoryChoice } from "@workspace/api-client"
import { categoriesListChoicesOptions } from "@workspace/api-client/query"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@workspace/ui/components/combobox"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@workspace/ui/components/item"

export function CategorySelect({
  value,
  onValueChange,
  ...props
}: Omit<React.ComponentProps<typeof ComboboxInput>, "value"> & {
  value: number | null
  onValueChange: (value: number | null) => void
}) {
  const { data: categories } = useQuery(categoriesListChoicesOptions())

  const selectedCategory =
    categories?.find((category) => category.id === value) ?? null

  return (
    <Combobox
      items={categories}
      value={selectedCategory}
      onValueChange={(category) => onValueChange(category?.id ?? null)}
      itemToStringValue={(category) => category.id.toString()}
      itemToStringLabel={(category) => category.name}
    >
      <ComboboxInput placeholder="Assign a category" showClear {...props} />
      <ComboboxContent>
        <ComboboxEmpty>No categories found.</ComboboxEmpty>
        <ComboboxList>
          {(category: CategoryChoice) => (
            <ComboboxItem key={category.id} value={category}>
              <Item size="sm" className="p-0">
                <ItemContent>
                  <ItemTitle>{category.name}</ItemTitle>
                  <ItemDescription>{category.description}</ItemDescription>
                </ItemContent>
              </Item>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
