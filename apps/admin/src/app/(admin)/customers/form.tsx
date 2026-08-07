import { useAppForm, withForm } from "@/hooks/form"
import { formOptions } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Customer, CustomerWritable } from "@workspace/api-client"
import {
  customersCreateMutation,
  customersListChoicesQueryKey,
  customersListQueryKey,
  customersUpdateMutation,
} from "@workspace/api-client/query"
import { zCustomerWritable } from "@workspace/api-client/zod"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"

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
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: customersListQueryKey() }),
      queryClient.invalidateQueries({
        queryKey: customersListChoicesQueryKey(),
      }),
    ])
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
  render: function Render({ form }) {
    return (
      <form
        id={form.formId}
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <FieldGroup>
          <form.Field
            name="name"
            children={(field) => {
              const fieldId = `${form.formId}-${field.name}`
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={fieldId}>Name</FieldLabel>
                  <Input
                    id={fieldId}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
          <form.Field
            name="email"
            children={(field) => {
              const fieldId = `${form.formId}-${field.name}`
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={fieldId}>Email</FieldLabel>
                  <Input
                    type="email"
                    id={fieldId}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
          <form.Field
            name="phone"
            children={(field) => {
              const fieldId = `${form.formId}-${field.name}`
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={fieldId}>Phone</FieldLabel>
                  <Input
                    id={fieldId}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
        </FieldGroup>
      </form>
    )
  },
})
