import { TanstackForm } from "@/components/form"
import { useAppForm, withForm } from "@/hooks/form"
import { formOptions } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Customer, CustomerWritable } from "@workspace/api-client"
import {
  customersCreateMutation,
  customersUpdateMutation,
} from "@workspace/api-client/query"
import { zCustomerWritable } from "@workspace/api-client/zod"
import { FieldGroup } from "@workspace/ui/components/field"
import { invalidateCustomers } from "../_lib/invalidate-customers"

const defaultValues: CustomerWritable = { name: "" }

const customerFormOpts = formOptions({
  defaultValues,
  validators: { onSubmit: zCustomerWritable },
})

export function useCustomerForm({
  customer,
  setOpen,
}: {
  customer?: Customer
  setOpen?: (open: boolean) => void
} = {}) {
  const queryClient = useQueryClient()
  const onSuccess = async () => {
    await invalidateCustomers(queryClient)
    setOpen?.(false)
  }
  const createMutation = useMutation({
    ...customersCreateMutation(),
    onSuccess,
  })
  const updateMutation = useMutation({
    ...customersUpdateMutation(),
    onSuccess,
  })

  return useAppForm({
    ...customerFormOpts,
    formId: customer
      ? `update-customer-form-${customer.id}`
      : "create-customer-form",
    defaultValues: { ...defaultValues, ...(customer ?? {}) },
    onSubmit: ({ value: body }) =>
      customer
        ? updateMutation.mutateAsync({ path: { id: customer.id }, body })
        : createMutation.mutateAsync({ body }),
  })
}

export const CustomerForm = withForm({
  ...customerFormOpts,
  props: { variant: "required" } as { variant?: "required" | "full" },
  render: function Render({ form, variant }) {
    const requiredFields = (
      <>
        <form.AppField
          name="name"
          children={(field) => (
            <field.Field>
              <field.FieldLabel>Name</field.FieldLabel>
              <field.Input />
              <field.FieldError />
            </field.Field>
          )}
        />
      </>
    )

    const fullFields = (
      <>
        {requiredFields}
        <form.AppField
          name="email"
          children={(field) => (
            <field.Field>
              <field.FieldLabel>Email</field.FieldLabel>
              <field.Input type="email" />
              <field.FieldError />
            </field.Field>
          )}
        />
        <form.AppField
          name="phone"
          children={(field) => (
            <field.Field>
              <field.FieldLabel>Phone</field.FieldLabel>
              <field.Input />
              <field.FieldError />
            </field.Field>
          )}
        />
      </>
    )

    return (
      <TanstackForm form={form}>
        <FieldGroup>
          {variant === "required" ? requiredFields : fullFields}
        </FieldGroup>
      </TanstackForm>
    )
  },
})
