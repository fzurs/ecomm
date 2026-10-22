import { useAppForm, withForm } from "@/hooks/form"
import { formOptions } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Category } from "@workspace/api-client"
import { categoriesCreateMutation } from "@workspace/api-client/query"
import { FieldGroup } from "@workspace/ui/components/field"
import { applyServerErrors } from "@/lib/utils"
import { invalidateCategories } from "../_lib/invalidate-categories"
import { categoryFormSchema } from "../_lib/category-schema"

// Quick create: only the name; the rest is filled in from the edit form.
const categoryCreateSchema = categoryFormSchema.pick({ name: true })

const categoryCreateFormOpts = formOptions({
  defaultValues: { name: "" },
  validators: { onSubmit: categoryCreateSchema },
})

export function useCategoryCreateForm({
  onSuccess,
}: {
  onSuccess?: (category: Category) => void
} = {}) {
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    ...categoriesCreateMutation(),
    onSuccess: () => invalidateCategories(queryClient),
  })

  return useAppForm({
    ...categoryCreateFormOpts,
    formId: "create-category-form",
    onSubmit: async ({ value, formApi }) => {
      try {
        const category = await mutateAsync({ body: value })
        onSuccess?.(category)
      } catch (error) {
        applyServerErrors(formApi, error)
      }
    },
  })
}

export const CategoryCreateForm = withForm({
  ...categoryCreateFormOpts,
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
