import { useAppForm, withForm } from "@/hooks/form"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-options"
import { formOptions } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { schemas } from "@workspace/api-client"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import z from "zod"

const defaultBrand: z.infer<typeof schemas.Brand> = {
  id: 0,
  name: "",
  description: "",
}

const brandFormOpts = formOptions({
  defaultValues: defaultBrand,
  validators: { onSubmit: schemas.Brand },
})

export function useBrandForm({
  item,
  setOpen,
}: {
  item?: z.infer<typeof schemas.Brand>
  setOpen: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    mutationFn: (data: z.infer<typeof schemas.Brand>) =>
      item
        ? apiClient.brands_update(data, {
            params: { slug: item.slug as string },
          })
        : apiClient.brands_create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brands.all() })
      setOpen(false)
    },
  })

  const form = useAppForm({
    ...brandFormOpts,
    formId: item ? `update-brand-form-${item.id}` : "create-brand-form",
    defaultValues: item ?? defaultBrand,
    onSubmit: ({ value }) => mutateAsync(value),
  })

  return form
}

export const BrandForm = withForm({
  ...brandFormOpts,
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
          <form.AppField
            name="name"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              const fieldId = `${form.formId}-${field.name}`
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={fieldId}>Name</FieldLabel>
                  <Input
                    id={fieldId}
                    name={field.name}
                    required
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    value={field.state.value as string}
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
