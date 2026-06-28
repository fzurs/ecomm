import { useAppForm, withForm } from "@/hooks/form"
import { apiClient } from "@/lib/api-client"
import { queryKeys } from "@/lib/query-options"
import { getFieldId } from "@/lib/utils"
import { formOptions } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { schemas } from "@workspace/api-client"
import { FieldGroup } from "@workspace/ui/components/field"
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

export const CategoryForm = withForm({
  ...categoryFormOpts,
  props: { variant: "full" } as { variant?: "full" | "required" },
  render: function Render({ form, variant }) {
    // const category = form.state.values

    const nameField = (
      <form.AppField
        name="name"
        children={(field) => {
          const fieldId = getFieldId(form, field)
          return (
            <field.Field>
              <field.Label htmlFor={fieldId}>Name</field.Label>
              <field.Input id={fieldId} />
              <field.Message />
            </field.Field>
          )
        }}
      />
    )

    const fullFields = (
      <>
        {nameField}
        <form.AppField
          name="description"
          children={(field) => {
            const fieldId = getFieldId(form, field)
            return (
              <field.Field>
                <field.Label htmlFor={fieldId}>Description</field.Label>
                <field.Textarea id={fieldId} />
                <field.Message />
              </field.Field>
            )
          }}
        />
      </>
    )

    return (
      <form.AppForm>
        <form.Form>
          <FieldGroup>
            {variant === "required" ? nameField : fullFields}
          </FieldGroup>
        </form.Form>
      </form.AppForm>
    )
  },
})
