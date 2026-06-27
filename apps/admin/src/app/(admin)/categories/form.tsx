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
import { Textarea } from "@workspace/ui/components/textarea"
import z from "zod"

const defaultCategory: z.infer<typeof schemas.Category> = {
  id: 0,
  name: "",
  description: "",
}

const categoryFormOpts = formOptions({
  defaultValues: defaultCategory,
  validators: { onSubmit: schemas.Category },
})

export function useCategoryForm({
  item,
  setOpen,
}: {
  item?: z.infer<typeof schemas.Category>
  setOpen: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    mutationFn: (data: z.infer<typeof schemas.Category>) =>
      item
        ? apiClient.categories_update(data, {
            params: { slug: item.slug as string },
          })
        : apiClient.categories_create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all() })
      setOpen(false)
    },
  })

  const form = useAppForm({
    ...categoryFormOpts,
    defaultValues: item ?? defaultCategory,
    formId: item ? `update-category-form-${item.id}` : "create-category-form",
    onSubmit: ({ value }) => mutateAsync(value),
  })

  return form
}

export const CategoryNameField = withForm({
  ...categoryFormOpts,
  render: function Render({ form }) {
    return (
      <form.AppField
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
                value={field.state.value as string}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          )
        }}
      />
    )
  },
})

export const CategoryFormWrapper = withForm({
  ...categoryFormOpts,
  props: { children: null as React.ReactNode },
  render: function Render({ form, children }) {
    return (
      <form
        id={form.formId}
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        {children}
      </form>
    )
  },
})

export const CategoryFormRequired = withForm({
  ...categoryFormOpts,
  render: function Render({ form }) {
    return (
      <CategoryFormWrapper form={form}>
        <CategoryNameField form={form} />
      </CategoryFormWrapper>
    )
  },
})

export const CategoryForm = withForm({
  ...categoryFormOpts,
  render: function Render({ form }) {
    const category = form.state.values
    return (
      <CategoryFormWrapper form={form}>
        <FieldGroup>
          <CategoryNameField form={form} />
          <form.AppField
            name="description"
            children={(field) => {
              const fieldId = `${form.formId}-${field.name}`
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={fieldId}>Description</FieldLabel>
                  <Textarea
                    id={fieldId}
                    name={field.name}
                    value={field.state.value as string}
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
      </CategoryFormWrapper>
    )
  },
})
