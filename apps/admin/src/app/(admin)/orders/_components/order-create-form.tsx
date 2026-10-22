"use client"
import { useAppForm, withForm } from "@/hooks/form"
import { formOptions, useSelector } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { OrderCreate } from "@workspace/api-client"
import {
  ordersCreateMutation,
  ordersListQueryKey,
} from "@workspace/api-client/query"
import { buttonVariants } from "@workspace/ui/components/button"
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
import { applyServerErrors } from "@/lib/utils"
import { orderFormSchema, OrderFormValues } from "../_lib/order-schema"
import { AddOrderItem } from "./add-order-item"
import { CustomerSelect } from "./customer-select"
import { OrderItemsField } from "./order-items-field"

const defaultValues: OrderFormValues = { customer: -1, items: [] }

const orderCreateFormOpts = formOptions({
  defaultValues,
  validators: { onSubmit: orderFormSchema },
})

export function useOrderCreateForm({
  onSuccess,
}: {
  onSuccess?: (order: OrderCreate) => void
} = {}) {
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    ...ordersCreateMutation(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ordersListQueryKey() }),
  })

  return useAppForm({
    ...orderCreateFormOpts,
    formId: "create-order-form",
    onSubmit: async ({ value, formApi }) => {
      try {
        const order = await mutateAsync({ body: value })
        onSuccess?.(order)
      } catch (error) {
        applyServerErrors(formApi, error)
      }
    },
  })
}

export const OrderCreateForm = withForm({
  ...orderCreateFormOpts,
  render: function Render({ form }) {
    const orderItems = useSelector(form.store, (state) => state.values.items)

    return (
      <form.AppForm>
        <form.Form>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Customer details</FieldLegend>
              <FieldDescription>
                Select the customer for this order and provide any additional
                order information.
              </FieldDescription>
              <FieldGroup>
                <form.Field
                  name="customer"
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
                          onValueChange={(value) =>
                            field.handleChange(value ?? -1)
                          }
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
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldGroup>
                  </FieldSet>
                )
              }}
            />
            <Field orientation="horizontal">
              <form.SubmitButton>Create order</form.SubmitButton>
              <Link
                href="/orders"
                className={buttonVariants({ variant: "outline" })}
              >
                Cancel
              </Link>
            </Field>
          </FieldGroup>
        </form.Form>
      </form.AppForm>
    )
  },
})
