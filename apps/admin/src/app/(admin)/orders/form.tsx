import { ComboboxQueryOnOpenById } from "@/components/combobox"
import { useAppForm, withForm } from "@/hooks/form"
import { formOptions } from "@tanstack/react-form"
import {
  queryOptions,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query"
import {
  Customer,
  OrderCreateWritable,
  OrderItemWritable,
  Product,
  UserDetails,
} from "@workspace/api-client"
import {
  customersListAllOptions,
  customersListOptions,
  ordersCreateMutation,
  ordersListQueryKey,
  productsListAllOptions,
} from "@workspace/api-client/query"
import {
  zOrderCreateWritable,
  zOrderItemWritable,
} from "@workspace/api-client/zod"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Button } from "@workspace/ui/components/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@workspace/ui/components/combobox"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@workspace/ui/components/field"
import { InputGroupAddon } from "@workspace/ui/components/input-group"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@workspace/ui/components/item"
import { X } from "lucide-react"
import React from "react"

const defaultOrderItem: OrderItemWritable = {
  product: 0,
  quantity: 1,
}
const defaultValues: OrderCreateWritable = {
  customer: 0,
  items: [defaultOrderItem],
}

export const createOrderFormOpts = formOptions({
  defaultValues,
  validators: { onSubmit: zOrderCreateWritable },
})

export function useCreateOrderForm({
  setOpen,
}: {
  setOpen: (open: boolean) => void
}) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    ...ordersCreateMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersListQueryKey() })
      setOpen(false)
    },
  })
  const form = useAppForm({
    ...createOrderFormOpts,
    onSubmit: ({ value }) => mutation.mutateAsync({ body: value }),
  })
  return form
}

export const CreateOrderForm = withForm({
  ...createOrderFormOpts,
  render: ({ form }) => {
    return (
      <form.AppForm>
        <form.Form>
          <FieldGroup>
            <form.AppField
              name="customer"
              children={(field) => (
                <field.Field>
                  <field.Label>Customer</field.Label>
                  <field.ComboboxQueryOnOpenById
                    initialItem={null}
                    itemsQueryOptions={customersListAllOptions()}
                  >
                    <ComboboxInput placeholder="Assing a customer" />
                    <ComboboxContent>
                      <ComboboxList>
                        {(customer: Customer) => (
                          <ComboboxItem key={customer.id} value={customer}>
                            {customer.name}
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    </ComboboxContent>
                  </field.ComboboxQueryOnOpenById>
                  <field.Message />
                </field.Field>
              )}
            />
            <FieldSeparator />
            <FieldSet>
              <FieldLegend>Items</FieldLegend>
              <FieldDescription>
                Product items to be ordered for the purchase.
              </FieldDescription>
              <form.AppField
                name="items"
                mode="array"
                children={(field) => (
                  <FieldGroup>
                    {field.state.value.map((_, i) => (
                      <div key={i} className="flex items-baseline-last gap-4">
                        <FieldGroup className="grid grid-cols-4 items-center gap-4">
                          <form.AppField name={`items[${i}].product`}>
                            {(subField) => (
                              <subField.Field className="col-span-3">
                                <subField.Label>Product</subField.Label>
                                <subField.ComboboxQueryOnOpenById
                                  itemsQueryOptions={productsListAllOptions()}
                                >
                                  <ComboboxValue>
                                    {(value: Product | null) => (
                                      <ComboboxInput>
                                        {value?.image && (
                                          <InputGroupAddon>
                                            <Avatar className="size-4">
                                              <AvatarImage src={value.image} />
                                              <AvatarFallback />
                                            </Avatar>
                                          </InputGroupAddon>
                                        )}
                                      </ComboboxInput>
                                    )}
                                  </ComboboxValue>
                                  <ComboboxContent>
                                    <ComboboxEmpty>No products.</ComboboxEmpty>
                                    <ComboboxList>
                                      {(product: Product) => (
                                        <ComboboxItem
                                          key={product.id}
                                          value={product}
                                          className="p-0"
                                        >
                                          <Item>
                                            <ItemMedia>
                                              <Avatar>
                                                <AvatarImage
                                                  src={product.image ?? ""}
                                                />
                                                <AvatarFallback />
                                              </Avatar>
                                            </ItemMedia>
                                            <ItemContent>
                                              <ItemTitle>
                                                {product.name}
                                              </ItemTitle>
                                              <ItemDescription>
                                                {product.description}
                                              </ItemDescription>
                                            </ItemContent>
                                          </Item>
                                        </ComboboxItem>
                                      )}
                                    </ComboboxList>
                                  </ComboboxContent>
                                </subField.ComboboxQueryOnOpenById>
                                <subField.Message />
                              </subField.Field>
                            )}
                          </form.AppField>
                          <form.AppField name={`items[${i}].quantity`}>
                            {(subField) => (
                              <subField.Field>
                                <subField.Label>Quantity</subField.Label>
                                <subField.NumberInput />
                                <subField.Message />
                              </subField.Field>
                            )}
                          </form.AppField>
                        </FieldGroup>
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="destructive"
                          onClick={() => field.removeValue(i)}
                        >
                          <X />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        field.insertValue(
                          field.state.value.length,
                          defaultOrderItem
                        )
                      }
                    >
                      Add New Item
                    </Button>
                  </FieldGroup>
                )}
              />
            </FieldSet>
          </FieldGroup>
        </form.Form>
      </form.AppForm>
    )
  },
})
