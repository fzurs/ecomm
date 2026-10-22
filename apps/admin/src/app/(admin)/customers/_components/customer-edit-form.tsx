import { useAppForm, withForm } from "@/hooks/form"
import { formOptions } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Customer } from "@workspace/api-client"
import { customersUpdateMutation } from "@workspace/api-client/query"
import { FieldGroup } from "@workspace/ui/components/field"
import { applyServerErrors } from "@/lib/utils"
import { invalidateCustomers } from "../_lib/invalidate-customers"
import {
  customerFormSchema,
  CustomerFormValues,
  toCustomerFormValues,
} from "../_lib/customer-schema"

const defaultValues: CustomerFormValues = {
  name: "",
  email: "",
  phone: "",
  document_number: "",
}

const customerEditFormOpts = formOptions({
  defaultValues,
  validators: { onSubmit: customerFormSchema },
})

export function useCustomerEditForm({
  customer,
  onSuccess,
}: {
  customer: Customer
  onSuccess?: (customer: Customer) => void
}) {
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    ...customersUpdateMutation(),
    onSuccess: () => invalidateCustomers(queryClient),
  })

  return useAppForm({
    ...customerEditFormOpts,
    formId: `update-customer-form-${customer.id}`,
    defaultValues: toCustomerFormValues(customer),
    onSubmit: async ({ value, formApi }) => {
      try {
        const updated = await mutateAsync({
          path: { id: customer.id },
          body: value,
        })
        onSuccess?.(updated)
      } catch (error) {
        applyServerErrors(formApi, error)
      }
    },
  })
}

export const CustomerEditForm = withForm({
  ...customerEditFormOpts,
  render: function Render({ form }) {
    return (
      <form.AppForm>
        <form.Form>
          <FieldGroup>
            <form.AppField
              name="name"
              children={(field) => <field.TextField label="Name" />}
            />
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
          </FieldGroup>
        </form.Form>
      </form.AppForm>
    )
  },
})
