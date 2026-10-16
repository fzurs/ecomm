"use client"
import { useAppForm } from "@/hooks/form"
import { useSelector } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { OrderCreateWritable } from "@workspace/api-client"
import {
  ordersCreateMutation,
  ordersListQueryKey,
} from "@workspace/api-client/query"
import { zOrderCreateWritable } from "@workspace/api-client/zod"
import { Button } from "@workspace/ui/components/button"
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
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AddOrderItem } from "./add-order-item"
import { CustomerSelect } from "./customer-select"
import { OrderItemsField } from "./order-items-field"

const defaultValues: OrderCreateWritable = { customer: -1, items: [] }

export function CreateOrderForm() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    ...ordersCreateMutation(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersListQueryKey() })
      router.push(`/orders`)
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
      id={form.formId}
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Customer details</FieldLegend>
          <FieldDescription>
            Select the customer for this order and provide any additional order
            information.
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
                    <FieldLegend>Order items</FieldLegend>
                    <FieldDescription>
                      Search for products, add them to the order, and adjust
                      quantities as needed.
                    </FieldDescription>
                  </div>
                  <AddOrderItem
                    orderItems={orderItems}
                    addOrderItem={field.insertValue}
                    replaceOrderItem={field.replaceValue}
                  />
                </div>
                <FieldGroup>
                  <OrderItemsField
                    orderItems={orderItems}
                    removeOrderItem={field.removeValue}
                    renderQuantity={(index) => (
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
          <form.AppForm>
            <form.SubmitButton>Save</form.SubmitButton>
          </form.AppForm>
          <Button variant="outline" type="button" asChild>
            <Link href="/orders">Cancel</Link>
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
