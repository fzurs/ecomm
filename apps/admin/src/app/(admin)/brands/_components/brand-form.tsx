import { useAppForm, withForm } from "@/hooks/form"
import { formOptions } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Brand, BrandWritable } from "@workspace/api-client"
import {
  brandsCreateMutation,
  brandsUpdateMutation,
} from "@workspace/api-client/query"
import { zBrandWritable } from "@workspace/api-client/zod"
import { FieldGroup } from "@workspace/ui/components/field"
import { invalidateBrands } from "../_lib/invalidate-brands"

const defaultValues: Brand | BrandWritable = {
  name: "",
}

const brandFormOpts = formOptions({
  defaultValues,
  validators: { onSubmit: zBrandWritable },
})

export function useBrandForm({
  brand,
  setOpen,
}: {
  brand?: Brand
  setOpen?: (open: boolean) => void
} = {}) {
  const queryClient = useQueryClient()

  const onSuccess = async () => {
    await invalidateBrands(queryClient)
    setOpen?.(false)
  }

  const updateMutation = useMutation({ ...brandsUpdateMutation(), onSuccess })
  const createMutation = useMutation({ ...brandsCreateMutation(), onSuccess })

  const formId = brand ? `update-brand-form-${brand.id}` : "create-brand-form"

  const form = useAppForm({
    ...brandFormOpts,
    formId,
    defaultValues: brand ?? defaultValues,
    onSubmit: ({ value: body }) =>
      brand
        ? updateMutation.mutateAsync({
            path: { slug: brand.slug as string },
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
