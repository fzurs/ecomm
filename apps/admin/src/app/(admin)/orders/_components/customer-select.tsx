"use client"
import { useQuery } from "@tanstack/react-query"
import { CustomerChoice } from "@workspace/api-client"
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
import { InputGroupAddon } from "@workspace/ui/components/input-group"
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
      >
        {/* inline-start addons go first (order-first), before the input text. */}
        {selectedCustomer && (
          <InputGroupAddon align="inline-start">
            <Avatar size="sm">
              {selectedCustomer.image && (
                <AvatarImage src={selectedCustomer.image} />
              )}
              <AvatarFallback />
            </Avatar>
          </InputGroupAddon>
        )}
      </ComboboxInput>
      <ComboboxContent>
        <ComboboxEmpty>No customers result.</ComboboxEmpty>
        <ComboboxList>
          {(customer: CustomerChoice) => (
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
