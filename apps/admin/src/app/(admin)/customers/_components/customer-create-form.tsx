import { useAppForm, withForm } from "@/hooks/form"
import { formOptions } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Customer } from "@workspace/api-client"
import { customersCreateMutation } from "@workspace/api-client/query"
import { FieldGroup } from "@workspace/ui/components/field"
import { applyServerErrors } from "@/lib/utils"
import { invalidateCustomers } from "../_lib/invalidate-customers"
import { customerFormSchema } from "../_lib/customer-schema"

// Quick create: only the name; the rest is filled in from the edit form.
const customerCreateSchema = customerFormSchema.pick({ name: true })

const customerCreateFormOpts = formOptions({
  defaultValues: { name: "" },
  validators: { onSubmit: customerCreateSchema },
})

export function useCustomerCreateForm({
  onSuccess,
}: {
  onSuccess?: (customer: Customer) => void
} = {}) {
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    ...customersCreateMutation(),
    onSuccess: () => invalidateCustomers(queryClient),
  })

  return useAppForm({
    ...customerCreateFormOpts,
    formId: "create-customer-form",
    onSubmit: async ({ value, formApi }) => {
      try {
        const customer = await mutateAsync({ body: value })
        onSuccess?.(customer)
      } catch (error) {
        applyServerErrors(formApi, error)
      }
    },
  })
}

export const CustomerCreateForm = withForm({
  ...customerCreateFormOpts,
  render: function Render({ form }) {
    return (
      <form.AppForm>
        <form.Form>
          <FieldGroup>
            <form.AppField
              name="name"
              children={(field) => <field.TextField label="Name" />}
            />
          </FieldGroup>
        </form.Form>
      </form.AppForm>
    )
  },
})
