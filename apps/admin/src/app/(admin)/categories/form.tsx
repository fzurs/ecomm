import { useAppForm, withForm } from "@/hooks/form"
import { getFieldId } from "@/lib/utils"
import { formOptions } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Category, CategoryWritable } from "@workspace/api-client"
import {
  categoriesCreateMutation,
  categoriesListQueryKey,
  categoriesUpdateMutation,
} from "@workspace/api-client/query"
import { zCategoryWritable } from "@workspace/api-client/zod"
import { FieldGroup } from "@workspace/ui/components/field"

const defaultValues: CategoryWritable | Category = {
  name: "",
  description: "",
}

const categoryFormOpts = formOptions({
  defaultValues,
  validators: { onSubmit: zCategoryWritable },
})

export function useCategoryForm({
  item,
  setOpen,
}: {
  item?: Category
  setOpen: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: categoriesListQueryKey() })
    setOpen?.(false)
  }

  const updateMutation = useMutation({
    ...categoriesUpdateMutation(),
    onSuccess,
  })
  const createMutation = useMutation({
    ...categoriesCreateMutation(),
    onSuccess,
  })

  const formId = item
    ? `update-category-form-${item.id}`
    : "create-category-form"

  const form = useAppForm({
    ...categoryFormOpts,
    formId,
    defaultValues: item ?? defaultValues,
    onSubmit: ({ value: body }) =>
      item
        ? updateMutation.mutateAsync({
            path: { slug: item.slug as string },
            body,
          })
        : createMutation.mutateAsync({ body }),
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
