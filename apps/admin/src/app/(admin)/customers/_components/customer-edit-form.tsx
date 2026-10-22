import { useAppForm, withForm } from "@/hooks/form"
import { formOptions } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Customer, CustomerWritable } from "@workspace/api-client"
import {
  customersCreateMutation,
  customersUpdateMutation,
} from "@workspace/api-client/query"
import { zCustomerWritable } from "@workspace/api-client/zod"
import { invalidateCustomers } from "../_lib/invalidate-customers"
import { FieldGroup } from "@workspace/ui/components/field"

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
    onSubmit: ({ value }) => {
      const body: CustomerWritable = { ...value, image: undefined }
      const headers = { "Content-Type": "multipart/form-data" }

      return customer
        ? updateMutation.mutateAsync({
            path: { id: customer.id },
            body,
            headers,
          })
        : createMutation.mutateAsync({ body, headers })
    },
  })
}

export const CustomerForm = withForm({
  ...customerFormOpts,
  props: { variant: "full" } as { variant?: "required" | "full" },
  render: function Render({ form, variant }) {
    const requiredFields = (
      <>
        <form.AppField
          name="name"
          children={(field) => <field.TextField label="Name" />}
        />
      </>
    )

    const fullFields = (
      <>
        {requiredFields}
        <form.AppField
          name="email"
          children={(field) => <field.EmailField />}
        />
        <form.AppField
          name="phone"
          children={(field) => <field.TextField label="Phone" />}
        />
        <form.AppField
          name="document_number"
          children={(field) => <field.TextField label="CUIT" />}
        />
      </>
    )

    return (
      <form.AppForm>
        <form.Form>
          <FieldGroup>
            {variant === "required" ? requiredFields : fullFields}
          </FieldGroup>
        </form.Form>
      </form.AppForm>
    )
  },
})
