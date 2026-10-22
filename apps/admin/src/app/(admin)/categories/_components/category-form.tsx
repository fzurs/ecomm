import { useAppForm, withForm } from "@/hooks/form"
import { formOptions } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Category, CategoryWritable } from "@workspace/api-client"
import {
  categoriesCreateMutation,
  categoriesUpdateMutation,
} from "@workspace/api-client/query"
import { zCategoryWritable } from "@workspace/api-client/zod"
import { FieldGroup } from "@workspace/ui/components/field"
import { invalidateCategories } from "../_lib/invalidate-categories"

const defaultValues: CategoryWritable | Category = {
  name: "",
  description: "",
}

const categoryFormOpts = formOptions({
  defaultValues,
  validators: { onSubmit: zCategoryWritable },
})

export function useCategoryForm({
  category,
  setOpen,
}: {
  category?: Category
  setOpen?: (open: boolean) => void
} = {}) {
  const queryClient = useQueryClient()

  const onSuccess = async () => {
    await invalidateCategories(queryClient)
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

  const formId = category
    ? `update-category-form-${category.id}`
    : "create-category-form"

  const form = useAppForm({
    ...categoryFormOpts,
    formId,
    defaultValues: category ?? defaultValues,
    onSubmit: ({ value: body }) =>
      category
        ? updateMutation.mutateAsync({
            path: { slug: category.slug as string },
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
    const nameField = (
      <form.AppField
        name="name"
        children={(field) => <field.TextField label="Name" />}
      />
    )

    const fullFields = (
      <>
        {nameField}
        <form.AppField
          name="description"
          children={(field) => <field.TextareaField label="Description" />}
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
