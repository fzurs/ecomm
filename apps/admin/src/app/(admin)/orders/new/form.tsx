"use client"
import { useAppForm } from "@/hooks/form"
import { useSelector } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Customer,
  OrderCreateWritable,
  OrderItemWritable,
} from "@workspace/api-client"
import {
  customersListAllOptions,
  ordersCreateMutation,
  ordersListQueryKey,
  productsListAllOptions,
} from "@workspace/api-client/query"
import { zOrderCreateWritable } from "@workspace/api-client/zod"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@workspace/ui/components/combobox"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@workspace/ui/components/command"
import {
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Field,
  FieldSeparator,
  FieldError,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { PlusIcon, XIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"

const defaultValues: OrderCreateWritable = { customer: -1, items: [] }

export function CreateOrderForm() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    ...ordersCreateMutation(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ordersListQueryKey() })
      router.push(`/orders/${data.id}`)
    },
  })

  const form = useAppForm({
    defaultValues,
    validators: { onSubmit: zOrderCreateWritable },
    onSubmit: ({ value }) => mutateAsync({ body: value }),
  })

  const orderItems = useSelector(form.store, (state) => state.values.items)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup>
        <FieldSet>
          <FieldLegend>New Order</FieldLegend>
          <FieldDescription>
            Select a customer, add products to the order, adjust quantities as
            needed, and review the order total before saving.
          </FieldDescription>
          <FieldGroup>
            <form.Field
              name="customer"
              validators={{
                onSubmit: ({ value }) =>
                  !value || value < 0
                    ? { message: "Please select a customer." }
                    : undefined,
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid} orientation="horizontal">
                    <FieldLabel htmlFor={field.name}>Customer</FieldLabel>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                    <CustomerSelect
                      value={field.state.value}
                      onValueChange={(value) => field.handleChange(value ?? -1)}
                    />
                  </Field>
                )
              }}
            />
          </FieldGroup>
        </FieldSet>
        <FieldSeparator />
        <form.Field
          name="items"
          mode="array"
          validators={{
            onSubmit: ({ value }) =>
              value.length < 1
                ? { message: "Please add at least one item to the order." }
                : undefined,
          }}
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid

            return (
              <FieldSet>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <FieldLegend>Items section</FieldLegend>
                    <FieldDescription>
                      Can select a few products in you order.
                    </FieldDescription>
                  </div>
                  <AddOrderItem
                    orderItems={orderItems}
                    addOrderItem={field.insertValue}
                    replaceOrderItem={field.replaceValue}
                  />
                </div>
                <FieldGroup>
                  <OrderItemsTable
                    orderItems={orderItems}
                    removeOrderItem={field.removeValue}
                    renderQuantityCell={(index) => (
                      <form.Field
                        name={`items[${index}].quantity`}
                        children={(subField) => {
                          const isInvalid =
                            subField.state.meta.isTouched &&
                            !subField.state.meta.isValid
                          return (
                            <Input
                              type="number"
                              id={subField.name}
                              name={subField.name}
                              value={subField.state.value}
                              onBlur={subField.handleBlur}
                              onChange={(e) => {
                                const value = Number(e.target.value)
                                subField.handleChange(value > 0 ? value : 1)
                              }}
                              aria-invalid={isInvalid}
                              className="max-w-20"
                            />
                          )
                        }}
                      />
                    )}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </FieldGroup>
              </FieldSet>
            )
          }}
        />
        <Field orientation="horizontal">
          <Button type="submit">Save</Button>
          <Button variant="outline" type="button" asChild>
            <Link href="/orders">Cancel</Link>
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

function CustomerSelect({
  value,
  onValueChange,
}: {
  value: number
  onValueChange: (value: number | null) => void
}) {
  const { data: customers } = useQuery(customersListAllOptions())

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
              {customer.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

function AddOrderItem({
  orderItems,
  addOrderItem,
  replaceOrderItem,
}: {
  orderItems: OrderItemWritable[]
  addOrderItem: (index: number, newItem: OrderItemWritable) => void
  replaceOrderItem: (index: number, updatedItem: OrderItemWritable) => void
}) {
  const { data: products } = useQuery(productsListAllOptions())

  const productItems = React.useMemo(
    () =>
      products?.map((product) => {
        const orderItemIndex = orderItems.findIndex(
          (item) => product.id === item.product
        )
        const orderItem = orderItems[orderItemIndex]
        const isSelected = orderItem !== undefined
        const onSelect = () => {
          if (isSelected) {
            replaceOrderItem(orderItemIndex, {
              ...orderItem,
              quantity: (orderItem.quantity ?? 0) + 1,
            })
          } else {
            addOrderItem(orderItems.length, {
              product: product.id,
              quantity: 1,
            })
          }
        }
        const quantity = orderItem?.quantity ?? 1
        return { product, isSelected, onSelect, quantity }
      }) ?? [],
    [addOrderItem, orderItems, products, replaceOrderItem]
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" size="sm" variant="secondary">
          <PlusIcon />
          Add Item
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="end">
        <Command>
          <CommandInput />
          <CommandList>
            <CommandGroup>
              {productItems.map(
                ({ product, isSelected, onSelect, quantity }) => (
                  <CommandItem
                    key={product.id}
                    value={product.name}
                    onSelect={onSelect}
                    className="justify-between gap-2"
                  >
                    {product.name}
                    {isSelected && <Badge variant="outline">x{quantity}</Badge>}
                  </CommandItem>
                )
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function OrderItemsTable({
  orderItems,
  renderQuantityCell,
  removeOrderItem,
}: {
  orderItems: OrderItemWritable[]
  renderQuantityCell: (index: number) => React.ReactNode
  removeOrderItem: (index: number) => void
}) {
  const { data: products } = useQuery(productsListAllOptions())

  const rows = React.useMemo(
    () =>
      orderItems.map((orderItem) => {
        const product = products?.find(
          (product) => product.id === orderItem.product
        )

        const subtotal =
          product?.price && orderItem.quantity
            ? product.price * orderItem.quantity
            : 0

        return {
          orderItem,
          product,
          subtotal,
        }
      }),
    [orderItems, products]
  )

  const total = rows.reduce((sum, row) => sum + row.subtotal, 0)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Unit Price</TableHead>
          <TableHead>Subtotal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map(({ product, subtotal }, index) => (
          <TableRow key={index}>
            <TableCell>{product?.name}</TableCell>
            <TableCell>{renderQuantityCell(index)}</TableCell>
            <TableCell>{product?.price}</TableCell>
            <TableCell>{subtotal}</TableCell>
            <TableCell>
              <Button
                type="button"
                variant="destructive"
                size="icon-xs"
                onClick={() => removeOrderItem(index)}
              >
                <XIcon />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell colSpan={2}>{total || ""}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
