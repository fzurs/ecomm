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
import {
  cuitRequiredVatConditions,
  documentTypeOptions,
  vatConditionOptions,
} from "@/lib/fiscal"
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
          {/* The outer group spaces the sections and the separator. */}
          <FieldGroup>
            {/* The groups and order of the customer details. */}
            <FieldSet>
              <FieldLegend>Contact</FieldLegend>
              <FieldGroup>
                <form.AppField
                  name="name"
                  children={(field) => <field.TextField label="Name" />}
                />
                <div className="grid grid-cols-2 items-start gap-4">
                  <form.AppField
                    name="email"
                    children={(field) => <field.EmailField />}
                  />
                  <form.AppField
                    name="phone"
                    children={(field) => <field.TextField label="Phone" />}
                  />
                </div>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
            <FieldSet>
              <FieldLegend>Billing</FieldLegend>
              <FieldDescription>
                The IVA condition decides the invoice letter: responsables
                inscriptos and monotributistas get Factura A, everyone else
                Factura B. A monotributista store issues Factura C to all.
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
                  {/* What the number needs depends on the IVA condition. */}
                  <form.Subscribe
                    selector={(state) => state.values.vat_condition}
                    children={(vatCondition) => (
                      <form.AppField
                        name="document_number"
                        children={(field) => (
                          <field.TextField
                            label="Number"
                            description={
                              cuitRequiredVatConditions.includes(vatCondition)
                                ? "Required: their CUIT, for Factura A."
                                : "Empty for an unidentified final consumer."
                            }
                          />
                        )}
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
                  children={(field) => (
                    <field.TextField
                      label="Address"
                      description="As on the invoice."
                    />
                  )}
                />
              </FieldGroup>
            </FieldSet>
          </FieldGroup>
        </form.Form>
      </form.AppForm>
    )
  },
})
