import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@workspace/ui/components/field"
import {
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@workspace/ui/components/combobox"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@workspace/ui/components/item"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as React from "react"
import { productStatusOptions } from "../_lib/product-status"
import { invalidateProducts } from "../_lib/invalidate-products"
import {
  InputGroupAddon,
  InputGroupButton,
} from "@workspace/ui/components/input-group"
import { IconLoader, IconSparkles, IconTextScan2 } from "@tabler/icons-react"
import { formOptions } from "@tanstack/react-form"
import { useAppForm, useTypedAppFormContext, withForm } from "@/hooks/form"
import { getFormFieldId } from "@/lib/utils"
import {
  BrandChoice,
  CategoryChoice,
  Product,
  ProductWritable,
} from "@workspace/api-client"
import { zProductWritable } from "@workspace/api-client/zod"
import {
  brandsListChoicesOptions,
  categoriesListChoicesOptions,
  productsCreateMutation,
  productsDetectAndAssignBrandCreateMutation,
  productsGenerateSkuCreateMutation,
  productsUpdateMutation,
} from "@workspace/api-client/query"
import z from "zod"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"
import { ComboboxQueryOnOpenById } from "@/components/combobox"
import { Checkbox } from "@workspace/ui/components/checkbox"

const formSchema = zProductWritable.extend({
  imageFile: z.instanceof(File).nullish(),
  clearImage: z.boolean().nullish(),
})

type ProductFormValues = z.infer<typeof formSchema>

const defaultValues: ProductFormValues = { name: "" }

const productFormOpts = formOptions({
  defaultValues,
  validators: { onSubmit: formSchema },
})

export function useProductForm({
  product,
  setOpen,
}: {
  product?: Product
  setOpen?: (open: boolean) => void
} = {}) {
  const queryClient = useQueryClient()

  const options = {
    onSuccess: async () => {
      await invalidateProducts(queryClient)
      setOpen?.(false)
    },
  }

  const updateMutation = useMutation({
    ...productsUpdateMutation(),
    ...options,
    onError: (error) => {
      if (error.response?.data) {
        Object.entries(error.response.data).forEach(([fieldName, messages]) => {
          form.setFieldMeta(fieldName as never, (prev) => ({
            ...prev,
            errorMap: { ...prev.errorMap, onSubmit: messages[0] },
          }))
        })
      }
    },
  })
  const createMutation = useMutation({
    ...options,
    ...productsCreateMutation(),
  })

  const formId = product
    ? `update-product-form-${product.slug ?? product.id}`
    : "create-product-form"

  const form = useAppForm({
    ...productFormOpts,
    defaultValues: { ...defaultValues, ...(product ?? {}) },
    formId,
    onSubmit: ({
      value: { imageFile = null, clearImage = false, discount_price, ...value },
    }) => {
      const body: ProductWritable = {
        ...value,
        image: clearImage ? "" : ((imageFile as never) ?? undefined),
        discount_price: discount_price ?? ("" as never),
      }
      const headers = {
        "Content-Type": "multipart/form-data",
      }
      return product
        ? updateMutation.mutateAsync({
            path: { slug: product.slug as string },
            body,
            headers,
          })
        : createMutation.mutateAsync({ body, headers })
    },
  })

  return form
}

export const ProductForm = withForm({
  ...productFormOpts,
  props: { variant: "full" } as { variant?: "full" | "required" },
  render: function Render({ form, variant }) {
    const product =
      "id" in form.state.values ? (form.state.values as Product) : undefined
    const getFieldId = getFormFieldId.bind(null, form)

    const nameField = (
      <form.AppField
        name="name"
        children={(field) => <field.TextField label="Name" />}
      />
    )

    const fullFields = (
      <>
        <form.AppField
          name="sku"
          children={(field) => (
            <field.InputGroupField
              label="SKU"
              description="Unique identifier code used to track and manage this product in your inventory."
            >
              {product && (
                <InputGroupAddon align="inline-end">
                  <GenerateSKUButton product={product} />
                </InputGroupAddon>
              )}
            </field.InputGroupField>
          )}
        />
        {nameField}
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
              {product?.image && <AvatarImage src={product.image} />}
              <AvatarFallback>
                {product?.image ? "Fail to load image" : "No image"}
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
                  <field.FileField disabled={clearImage ?? false} />
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
                <ComboboxQueryOnOpenById
                  initialItem={product?.category}
                  itemsQueryOptions={categoriesListChoicesOptions()}
                  value={field.state.value ?? null}
                  onValueChange={field.handleChange}
                >
                  <ComboboxInput placeholder="Assing a category" />
                  <ComboboxContent>
                    <ComboboxEmpty>No categories found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item: CategoryChoice) => (
                        <ComboboxItem key={item.id} value={item}>
                          <Item size="sm" className="p-0">
                            <ItemContent>
                              <ItemTitle>{item.name}</ItemTitle>
                              <ItemDescription>
                                {item.description}
                              </ItemDescription>
                            </ItemContent>
                          </Item>
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </ComboboxQueryOnOpenById>
                <FieldDescription>
                  The category allows you to group products.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                <ComboboxQueryOnOpenById
                  itemsQueryOptions={brandsListChoicesOptions()}
                  initialItem={product?.brand}
                  value={field.state.value ?? null}
                  onValueChange={field.handleChange}
                >
                  <ComboboxInput placeholder="Assing a brand">
                    {product && (
                      <InputGroupAddon align="inline-end">
                        <DetectAndAssignBrandButton product={product} />
                      </InputGroupAddon>
                    )}
                  </ComboboxInput>
                  <ComboboxContent>
                    <ComboboxEmpty>No brands found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item: BrandChoice) => (
                        <ComboboxItem key={item.id} value={item}>
                          {item.name}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </ComboboxQueryOnOpenById>
                <FieldDescription>
                  The product&apos;s brand can be inferred from its name.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                      Featured products are displayed on the home page and in
                      priority search results.
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

function GenerateSKUButton({
  product,
  size = "icon-xs",
  ...props
}: React.ComponentProps<typeof InputGroupButton> & {
  product: Product
}) {
  const queryClient = useQueryClient()
  const form = useTypedAppFormContext(productFormOpts)

  const { mutate, isPending } = useMutation({
    ...productsGenerateSkuCreateMutation(),
    onSuccess: async (data) => {
      await invalidateProducts(queryClient)
      form.reset(data)
    },
  })

  const onClick = () =>
    mutate({ path: { slug: product.slug as string }, body: product })

  return (
    <InputGroupButton onClick={onClick} size={size} {...props}>
      {isPending ? <IconLoader className="animate-spin" /> : <IconSparkles />}
    </InputGroupButton>
  )
}

function DetectAndAssignBrandButton({
  product,
  size = "icon-xs",
  ...props
}: React.ComponentProps<typeof InputGroupButton> & {
  product: Product
}) {
  const queryClient = useQueryClient()
  const form = useTypedAppFormContext(productFormOpts)

  const { mutate, isPending } = useMutation({
    ...productsDetectAndAssignBrandCreateMutation(),
    onSuccess: async (data) => {
      await invalidateProducts(queryClient)
      form.reset(data)
    },
  })

  const onClick = () =>
    mutate({ path: { slug: product.slug as string }, body: product })

  return (
    <InputGroupButton onClick={onClick} size={size} {...props}>
      {isPending ? <IconLoader className="animate-spin" /> : <IconTextScan2 />}
    </InputGroupButton>
  )
}
