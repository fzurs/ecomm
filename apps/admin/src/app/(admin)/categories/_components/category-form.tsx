import { useAppForm, withForm } from "@/hooks/form"
import { formOptions } from "@tanstack/react-form"
import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query"
import { Category, CategoryWritable } from "@workspace/api-client"
import {
  categoriesCreateMutation,
  categoriesListChoicesQueryKey,
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

export const invalidateCategories = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: categoriesListQueryKey() }),
    queryClient.invalidateQueries({
      queryKey: categoriesListChoicesQueryKey(),
    }),
  ])
}

export function useCategoryForm({
  item,
  setOpen,
}: {
  item?: Category
  setOpen: (open: boolean) => void
}) {
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
