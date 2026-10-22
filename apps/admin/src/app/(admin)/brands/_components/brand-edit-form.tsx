import { useAppForm, withForm } from "@/hooks/form"
import { formOptions } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Brand } from "@workspace/api-client"
import { brandsUpdateMutation } from "@workspace/api-client/query"
import { FieldGroup } from "@workspace/ui/components/field"
import { applyServerErrors } from "@/lib/utils"
import { invalidateBrands } from "../_lib/invalidate-brands"
import {
  brandFormSchema,
  BrandFormValues,
  toBrandFormValues,
} from "../_lib/brand-schema"

const defaultValues: BrandFormValues = { name: "" }

const brandEditFormOpts = formOptions({
  defaultValues,
  validators: { onSubmit: brandFormSchema },
})

export function useBrandEditForm({
  brand,
  onSuccess,
}: {
  brand: Brand
  onSuccess?: (brand: Brand) => void
}) {
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    ...brandsUpdateMutation(),
    onSuccess: () => invalidateBrands(queryClient),
  })

  return useAppForm({
    ...brandEditFormOpts,
    formId: `update-brand-form-${brand.id}`,
    defaultValues: toBrandFormValues(brand),
    onSubmit: async ({ value, formApi }) => {
      try {
        const updated = await mutateAsync({
          path: { slug: brand.slug as string },
          body: value,
        })
        onSuccess?.(updated)
      } catch (error) {
        applyServerErrors(formApi, error)
      }
    },
  })
}

export const BrandEditForm = withForm({
  ...brandEditFormOpts,
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
