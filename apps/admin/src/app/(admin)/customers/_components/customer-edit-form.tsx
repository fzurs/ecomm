import { useAppForm, withForm } from "@/hooks/form"
import { formOptions } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Customer } from "@workspace/api-client"
import { customersUpdateMutation } from "@workspace/api-client/query"
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@workspace/ui/components/field"
import { documentTypeOptions, vatConditionOptions } from "@/lib/fiscal"
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
  document_type: 80,
  document_number: "",
  vat_condition: 5,
  legal_name: "",
  address: "",
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
          </FieldGroup>
          <FieldSeparator />
          <FieldSet>
            <FieldLegend>Billing</FieldLegend>
            <FieldDescription>
              The IVA condition decides the invoice: Factura A for responsables
              inscriptos and monotributistas (with their CUIT), Factura B for
              everyone else.
            </FieldDescription>
            <FieldGroup>
              <form.AppField
                name="vat_condition"
                children={(field) => (
                  <field.SelectField
                    label="IVA condition"
                    options={vatConditionOptions}
                  />
                )}
              />
              <div className="grid grid-cols-[8rem_1fr] items-start gap-4">
                <form.AppField
                  name="document_type"
                  children={(field) => (
                    <field.SelectField
                      label="Document"
                      options={documentTypeOptions}
                    />
                  )}
                />
                <form.AppField
                  name="document_number"
                  children={(field) => (
                    <field.TextField
                      label="Number"
                      description="Empty for an unidentified final consumer."
                    />
                  )}
                />
              </div>
              <form.AppField
                name="legal_name"
                children={(field) => (
                  <field.TextField
                    label="Legal name"
                    description="As on the invoice. Empty uses the name."
                  />
                )}
              />
              <form.AppField
                name="address"
                children={(field) => <field.TextField label="Address" />}
              />
            </FieldGroup>
          </FieldSet>
        </form.Form>
      </form.AppForm>
    )
  },
})
