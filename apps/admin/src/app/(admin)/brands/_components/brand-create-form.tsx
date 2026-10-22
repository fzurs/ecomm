import { useAppForm, withForm } from "@/hooks/form"
import { formOptions } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Brand } from "@workspace/api-client"
import { brandsCreateMutation } from "@workspace/api-client/query"
import { FieldGroup } from "@workspace/ui/components/field"
import { applyServerErrors } from "@/lib/utils"
import { invalidateBrands } from "../_lib/invalidate-brands"
import { brandFormSchema, BrandFormValues } from "../_lib/brand-schema"

const defaultValues: BrandFormValues = { name: "" }

const brandCreateFormOpts = formOptions({
  defaultValues,
  validators: { onSubmit: brandFormSchema },
})

export function useBrandCreateForm({
  onSuccess,
}: {
  onSuccess?: (brand: Brand) => void
} = {}) {
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    ...brandsCreateMutation(),
    onSuccess: () => invalidateBrands(queryClient),
  })

  return useAppForm({
    ...brandCreateFormOpts,
    formId: "create-brand-form",
    onSubmit: async ({ value, formApi }) => {
      try {
        const brand = await mutateAsync({ body: value })
        onSuccess?.(brand)
      } catch (error) {
        applyServerErrors(formApi, error)
      }
    },
  })
}

export const BrandCreateForm = withForm({
  ...brandCreateFormOpts,
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
