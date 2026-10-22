import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@workspace/ui/components/field"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as React from "react"
import { productStatusOptions } from "../_lib/product-status"
import { invalidateProducts } from "../_lib/invalidate-products"
import { productFormSchema, toProductFormValues } from "../_lib/product-schema"
import {
  InputGroupAddon,
  InputGroupButton,
} from "@workspace/ui/components/input-group"
import { SparklesIcon } from "lucide-react"
import { Spinner } from "@workspace/ui/components/spinner"
import { formOptions } from "@tanstack/react-form"
import { useAppForm, useTypedAppFormContext, withForm } from "@/hooks/form"
import { applyServerErrors, getFormFieldId } from "@/lib/utils"
import { Product, ProductWritable } from "@workspace/api-client"
import {
  productsGenerateSkuCreateMutation,
  productsUpdateMutation,
} from "@workspace/api-client/query"
import z from "zod"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { BrandSelect } from "./brand-select"
import { CategorySelect } from "./category-select"

// Only the edit form uploads or clears the image.
const productEditSchema = productFormSchema.extend({
  imageFile: z.instanceof(File).nullable(),
  clearImage: z.boolean(),
})

type ProductEditFormValues = z.infer<typeof productEditSchema>

const defaultValues: ProductEditFormValues = {
  sku: "",
  name: "",
  description: "",
  category_id: null,
  brand_id: null,
  featured: false,
  price: null,
  discount_price: null,
  imageFile: null,
  clearImage: false,
}

const productEditFormOpts = formOptions({
  defaultValues,
  validators: { onSubmit: productEditSchema },
})

export function useProductEditForm({
  product,
  onSuccess,
}: {
  product: Product
  onSuccess?: (product: Product) => void
}) {
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    ...productsUpdateMutation(),
    onSuccess: () => invalidateProducts(queryClient),
  })

  const values: ProductEditFormValues = {
    ...toProductFormValues(product),
    imageFile: null,
    clearImage: false,
  }

  return useAppForm({
    ...productEditFormOpts,
    formId: `update-product-form-${product.id}`,
    defaultValues: values,
    onSubmit: async ({
      value: { imageFile, clearImage, discount_price, ...value },
      formApi,
    }) => {
      // Sent as multipart for the image upload: "" clears a field, since a
      // multipart body can't carry null.
      const body: ProductWritable = {
        ...value,
        image: clearImage ? "" : ((imageFile as never) ?? undefined),
        discount_price: discount_price ?? ("" as never),
      }
      try {
        const updated = await mutateAsync({
          path: { slug: product.slug as string },
          body,
          headers: { "Content-Type": "multipart/form-data" },
        })
        onSuccess?.(updated)
      } catch (error) {
        applyServerErrors(formApi, error)
      }
    },
  })
}

export const ProductEditForm = withForm({
  ...productEditFormOpts,
  props: {} as { product: Product },
  render: function Render({ form, product }) {
    const getFieldId = getFormFieldId.bind(null, form)

    return (
      <form.AppForm>
        <form.Form>
          <FieldGroup>
            <form.AppField
              name="sku"
              children={(field) => (
                <field.InputGroupField
                  label="SKU"
                  description="Unique identifier code used to track and manage this product in your inventory."
                >
                  <InputGroupAddon align="inline-end">
                    <GenerateSKUButton product={product} />
                  </InputGroupAddon>
                </field.InputGroupField>
              )}
            />
            <form.AppField
              name="name"
              children={(field) => <field.TextField label="Name" />}
            />
            <form.AppField
              name="description"
              children={(field) => (
                <field.TextareaField
                  label="Description"
                  placeholder="Describe your product in detail."
                />
              )}
            />
            <FieldGroup>
              <Field>
                <FieldLabel id={`${form.formId}-image`}>Image</FieldLabel>
                <Avatar shape="square" className="aspect-square size-full">
                  {product.image && <AvatarImage src={product.image} />}
                  <AvatarFallback>
                    {product.image ? "Fail to load image" : "No image"}
                  </AvatarFallback>
                </Avatar>
              </Field>
              <form.AppField
                name="clearImage"
                children={(field) => (
                  <field.CheckboxField label="Clear product image" />
                )}
              />
              <form.Subscribe selector={(state) => state.values.clearImage}>
                {(clearImage) => (
                  <form.AppField
                    name="imageFile"
                    children={(field) => (
                      <field.FileField disabled={clearImage} />
                    )}
                  />
                )}
              </form.Subscribe>
            </FieldGroup>
            <form.AppField
              name="category_id"
              children={(field) => {
                const fieldId = getFieldId(field)
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={fieldId}>Category</FieldLabel>
                    <CategorySelect
                      id={fieldId}
                      aria-invalid={isInvalid}
                      value={field.state.value ?? null}
                      onValueChange={field.handleChange}
                    />
                    <FieldDescription>
                      The category allows you to group products.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <form.AppField
              name="brand_id"
              children={(field) => {
                const fieldId = getFieldId(field)
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid

                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={fieldId}>Brand</FieldLabel>
                    <BrandSelect
                      id={fieldId}
                      aria-invalid={isInvalid}
                      value={field.state.value ?? null}
                      onValueChange={field.handleChange}
                    />
                    <FieldDescription>
                      The brand the product is sold under.
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />
            <form.AppField
              name="status"
              children={(field) => (
                <field.SelectField
                  label="Status"
                  description='By default, the product status is "draft".'
                  options={productStatusOptions}
                />
              )}
            />
            <form.AppField
              name="featured"
              children={(field) => {
                const fieldId = getFieldId(field)
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <FieldLabel htmlFor={fieldId}>
                    <Field data-invalid={isInvalid} orientation="horizontal">
                      <Checkbox
                        id={fieldId}
                        name={field.name}
                        aria-invalid={isInvalid}
                        checked={field.state.value as boolean}
                        onBlur={field.handleBlur}
                        onCheckedChange={(checked) =>
                          field.handleChange(checked === true)
                        }
                      />
                      <FieldContent>
                        <FieldTitle>Featured product</FieldTitle>
                        <FieldDescription>
                          Featured products are displayed on the home page and
                          in priority search results.
                        </FieldDescription>
                      </FieldContent>
                    </Field>
                  </FieldLabel>
                )
              }}
            />
            <div className="grid grid-cols-2 gap-4">
              <form.AppField
                name="price"
                children={(field) => (
                  <field.NumberField
                    label="Price"
                    description="The actual price of product."
                  />
                )}
              />
              <form.AppField
                name="discount_price"
                children={(field) => (
                  <field.NumberField
                    label="Discount"
                    description="Discounted price after applying any promotions or coupon codes."
                  />
                )}
              />
            </div>
          </FieldGroup>
        </form.Form>
      </form.AppForm>
    )
  },
})

// The SKU helper saves on the server and only updates its own field, so other
// unsaved edits in the form are kept.

function GenerateSKUButton({
  product,
  size = "icon-xs",
  ...props
}: React.ComponentProps<typeof InputGroupButton> & {
  product: Product
}) {
  const queryClient = useQueryClient()
  const form = useTypedAppFormContext(productEditFormOpts)

  const { mutate, isPending } = useMutation({
    ...productsGenerateSkuCreateMutation(),
    onSuccess: async (data) => {
      await invalidateProducts(queryClient)
      form.setFieldValue("sku", data.sku ?? "")
    },
  })

  const onClick = () =>
    mutate({ path: { slug: product.slug as string }, body: product })

  return (
    <InputGroupButton onClick={onClick} size={size} {...props}>
      {isPending ? <Spinner /> : <SparklesIcon />}
    </InputGroupButton>
  )
}
