import { useAppForm, withForm } from "@/hooks/form"
import { formOptions } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Category } from "@workspace/api-client"
import { categoriesUpdateMutation } from "@workspace/api-client/query"
import { FieldGroup } from "@workspace/ui/components/field"
import { applyServerErrors } from "@/lib/utils"
import { invalidateCategories } from "../_lib/invalidate-categories"
import {
  categoryFormSchema,
  CategoryFormValues,
  toCategoryFormValues,
} from "../_lib/category-schema"

const defaultValues: CategoryFormValues = { name: "", description: "" }

const categoryEditFormOpts = formOptions({
  defaultValues,
  validators: { onSubmit: categoryFormSchema },
})

export function useCategoryEditForm({
  category,
  onSuccess,
}: {
  category: Category
  onSuccess?: (category: Category) => void
}) {
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    ...categoriesUpdateMutation(),
    onSuccess: () => invalidateCategories(queryClient),
  })

  return useAppForm({
    ...categoryEditFormOpts,
    formId: `update-category-form-${category.id}`,
    defaultValues: toCategoryFormValues(category),
    onSubmit: async ({ value, formApi }) => {
      try {
        const updated = await mutateAsync({
          path: { slug: category.slug as string },
          body: value,
        })
        onSuccess?.(updated)
      } catch (error) {
        applyServerErrors(formApi, error)
      }
    },
  })
}

export const CategoryEditForm = withForm({
  ...categoryEditFormOpts,
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
              name="description"
              children={(field) => <field.TextareaField label="Description" />}
            />
          </FieldGroup>
        </form.Form>
      </form.AppForm>
    )
  },
})
