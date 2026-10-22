import { useAppForm, withForm } from "@/hooks/form"
import { formOptions } from "@tanstack/react-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Product } from "@workspace/api-client"
import { productsCreateMutation } from "@workspace/api-client/query"
import { FieldGroup } from "@workspace/ui/components/field"
import { applyServerErrors } from "@/lib/utils"
import { invalidateProducts } from "../_lib/invalidate-products"
import { productFormSchema } from "../_lib/product-schema"

// Quick create: only the name; the rest is filled in from the edit form.
const productCreateSchema = productFormSchema.pick({ name: true })

const productCreateFormOpts = formOptions({
  defaultValues: { name: "" },
  validators: { onSubmit: productCreateSchema },
})

export function useProductCreateForm({
  onSuccess,
}: {
  onSuccess?: (product: Product) => void
} = {}) {
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    ...productsCreateMutation(),
    onSuccess: () => invalidateProducts(queryClient),
  })

  return useAppForm({
    ...productCreateFormOpts,
    formId: "create-product-form",
    onSubmit: async ({ value, formApi }) => {
      try {
        const product = await mutateAsync({ body: value })
        onSuccess?.(product)
      } catch (error) {
        applyServerErrors(formApi, error)
      }
    },
  })
}

export const ProductCreateForm = withForm({
  ...productCreateFormOpts,
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
