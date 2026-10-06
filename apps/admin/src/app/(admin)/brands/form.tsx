import { useAppForm, withForm } from "@/hooks/form"
import { formOptions } from "@tanstack/react-form"
import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query"
import { Brand, BrandWritable } from "@workspace/api-client"
import {
  brandsCreateMutation,
  brandsListChoicesQueryKey,
  brandsListQueryKey,
  brandsUpdateMutation,
} from "@workspace/api-client/query"
import { zBrandWritable } from "@workspace/api-client/zod"
import { FieldGroup } from "@workspace/ui/components/field"

const defaultValues: Brand | BrandWritable = {
  name: "",
}

const brandFormOpts = formOptions({
  defaultValues,
  validators: { onSubmit: zBrandWritable },
})

export const invalidateBrands = async (queryClient: QueryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: brandsListQueryKey() }),
    queryClient.invalidateQueries({ queryKey: brandsListChoicesQueryKey() }),
  ])
}

export function useBrandForm({
  item,
  setOpen,
}: {
  item?: Brand
  setOpen: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const onSuccess = async () => {
    await invalidateBrands(queryClient)
    setOpen?.(false)
  }

  const updateMutation = useMutation({ ...brandsUpdateMutation(), onSuccess })
  const createMutation = useMutation({ ...brandsCreateMutation(), onSuccess })

  const formId = item ? `update-brand-form-${item.id}` : "create-brand-form"

  const form = useAppForm({
    ...brandFormOpts,
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

export const BrandForm = withForm({
  ...brandFormOpts,
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
