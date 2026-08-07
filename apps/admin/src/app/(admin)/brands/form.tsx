import { useAppForm, withForm } from "@/hooks/form"
import { getFormFieldId } from "@/lib/utils"
import { formOptions } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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

export function useBrandForm({
  item,
  setOpen,
}: {
  item?: Brand
  setOpen: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const onSuccess = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: brandsListQueryKey() }),
      queryClient.invalidateQueries({ queryKey: brandsListChoicesQueryKey() }),
    ])
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
    const getFieldId = getFormFieldId.bind(null, form)
    return (
      <form.AppForm>
        <form.Form>
          <FieldGroup>
            <form.AppField
              name="name"
              children={(field) => {
                const fieldId = getFieldId(field)
                return (
                  <field.Field>
                    <field.Label htmlFor={fieldId}>Name</field.Label>
                    <field.Input id={fieldId} required />
                    <field.Message />
                  </field.Field>
                )
              }}
            />
          </FieldGroup>
        </form.Form>
      </form.AppForm>
    )
  },
})
