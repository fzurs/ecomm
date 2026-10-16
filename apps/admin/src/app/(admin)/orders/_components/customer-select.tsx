"use client"
import { useQuery } from "@tanstack/react-query"
import { Customer } from "@workspace/api-client"
import { customersListChoicesOptions } from "@workspace/api-client/query"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
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
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item"

export function CustomerSelect({
  value,
  onValueChange,
}: {
  value: number
  onValueChange: (value: number | null) => void
}) {
  const { data: customers } = useQuery(customersListChoicesOptions())

  const selectedCustomer = customers?.find((customer) => customer.id === value)

  return (
    <Combobox
      items={customers}
      value={selectedCustomer ?? null}
      onValueChange={(customer) => onValueChange(customer?.id ?? null)}
      itemToStringValue={(customer) => customer.id.toString()}
      itemToStringLabel={(customer) => customer.name}
    >
      <ComboboxInput
        placeholder="Select a customer"
        className="w-full max-w-xs"
        showClear
      />
      <ComboboxContent>
        <ComboboxEmpty>No customers result.</ComboboxEmpty>
        <ComboboxList>
          {(customer: Customer) => (
            <ComboboxItem key={customer.id} value={customer}>
              <Item className="p-0" size="sm">
                <ItemMedia>
                  <Avatar size="sm">
                    {customer.image && <AvatarImage src={customer.image} />}
                    <AvatarFallback />
                  </Avatar>
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{customer.name}</ItemTitle>
                </ItemContent>
              </Item>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
