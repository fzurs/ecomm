import {
  Field,
  FieldContent,
  FieldDescription,
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
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "@workspace/ui/components/select"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as React from "react"
import { ProductImagePreview, statusOptions } from "./columns"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@workspace/ui/components/input-group"
import { IconLoader, IconSparkles, IconTextScan2 } from "@tabler/icons-react"
import { formOptions } from "@tanstack/react-form"
import { useAppForm, useTypedAppFormContext, withForm } from "@/hooks/form"
import { getFieldId as getFieldIdPrimitive, setFormErrors } from "@/lib/utils"
import {
  Brand,
  Category,
  Product,
  ProductWritable,
} from "@workspace/api-client"
import { zProductWritable } from "@workspace/api-client/zod"
import {
  brandsListAllOptions,
  categoriesListAllOptions,
  productsCreateMutation,
  productsDetectAndAssignBrandCreateMutation,
  productsGenerateSkuCreateMutation,
  productsListQueryKey,
  productsUpdateMutation,
} from "@workspace/api-client/query"
import z from "zod"

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
  item,
  setOpen,
}: {
  item?: Product
  setOpen?: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const options = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsListQueryKey() })
      setOpen?.(false)
    },
    onError: (err: any) => {
      setFormErrors(form, err)
    },
  }

  const updateMutation = useMutation({
    ...options,
    ...productsUpdateMutation(),
  })
  const createMutation = useMutation({
    ...options,
    ...productsCreateMutation(),
  })

  const formId = item
    ? `update-product-form-${item.slug ?? item.id}`
    : "create-product-form"

  const form = useAppForm({
    ...productFormOpts,
    defaultValues: { ...defaultValues, ...(item ?? {}) },
    formId,
    onSubmit: ({
      value: { imageFile = null, clearImage = false, ...value },
    }) => {
      const body: ProductWritable = {
        ...value,
        image: clearImage ? "" : ((imageFile as never) ?? undefined),
      }
      const headers = {
        "Content-Type": "multipart/form-data",
      }
      item
        ? updateMutation.mutateAsync({
            path: { slug: item.slug as string },
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
    const defValues = form.options.defaultValues ?? {}
    const product = "id" in defValues ? (defValues as Product) : undefined
    const getFieldId = getFieldIdPrimitive.bind(null, form)

    const nameField = (
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
    )

    const fullFields = (
      <>
        <form.AppField
          name="sku"
          children={(field) => {
            const fieldId = getFieldId(field)
            return (
              <field.Field>
                <field.Label htmlFor={fieldId}>SKU</field.Label>
                <InputGroup>
                  <field.InputGroupInput id={fieldId} />
                  {product && (
                    <InputGroupAddon align="inline-end">
                      <GenerateSKUButton product={product} />
                    </InputGroupAddon>
                  )}
                </InputGroup>
                <FieldDescription>
                  Unique identifier code used to track and manage this product
                  in your inventory.
                </FieldDescription>
                <field.Message />
              </field.Field>
            )
          }}
        />
        {nameField}
        <form.AppField
          name="description"
          children={(field) => {
            const fieldId = getFieldId(field)
            return (
              <field.Field>
                <field.Label htmlFor={fieldId}>Description</field.Label>
                <field.Textarea
                  id={fieldId}
                  placeholder="Describe your product in detail: features, materials, dimensions, and any other relevant information..."
                />
                <field.Message />
              </field.Field>
            )
          }}
        />
        <FieldGroup>
          <Field>
            <FieldLabel id={`${form.formId}-image`}>Image</FieldLabel>
            <ProductImagePreview product={product} />
          </Field>
          <form.AppField
            name="clearImage"
            children={(field) => {
              const fieldId = getFieldId(field)
              return (
                <field.Field orientation="horizontal">
                  <field.Checkbox id={fieldId} />
                  <field.Label htmlFor={fieldId} className="font-normal">
                    Clear product image
                  </field.Label>
                </field.Field>
              )
            }}
          />
          <form.Subscribe selector={(state) => state.values.clearImage}>
            {(clearImage) => (
              <form.AppField
                name="imageFile"
                children={(field) => {
                  const fieldId = getFieldId(field)
                  return (
                    <field.Field>
                      <field.ImageInput
                        id={fieldId}
                        disabled={clearImage ?? false}
                      />
                      <field.Message />
                    </field.Field>
                  )
                }}
              />
            )}
          </form.Subscribe>
        </FieldGroup>
        <form.AppField
          name="category_id"
          children={(field) => {
            const fieldId = getFieldId(field)
            return (
              <field.Field>
                <field.Label htmlFor={fieldId}>Category</field.Label>
                <field.ComboboxQueryOnOpenById
                  initialItem={product?.category}
                  itemsQueryOptions={categoriesListAllOptions()}
                >
                  <ComboboxInput placeholder="Assing a category" />
                  <ComboboxContent>
                    <ComboboxEmpty>No categories found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item: Category) => (
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
                </field.ComboboxQueryOnOpenById>
                <FieldDescription>
                  The category allows you to group products.
                </FieldDescription>
                <field.Message />
              </field.Field>
            )
          }}
        />
        <form.AppField
          name="brand_id"
          children={(field) => {
            const fieldId = getFieldId(field)
            return (
              <field.Field>
                <field.Label htmlFor={fieldId}>Brand</field.Label>
                <field.ComboboxQueryOnOpenById
                  itemsQueryOptions={brandsListAllOptions()}
                  initialItem={product?.brand}
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
                      {(item: Brand) => (
                        <ComboboxItem key={item.id} value={item}>
                          {item.name}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </field.ComboboxQueryOnOpenById>
                <FieldDescription>
                  The product&apos;s brand can be inferred from its name.
                </FieldDescription>
                <field.Message />
              </field.Field>
            )
          }}
        />
        <form.AppField
          name="status"
          children={(field) => {
            const fieldId = getFieldId(field)
            return (
              <field.Field>
                <field.Label htmlFor={fieldId}>Status</field.Label>
                <field.Select>
                  <field.SelectTrigger id={fieldId} className="w-full">
                    <SelectValue />
                  </field.SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </field.Select>
                <FieldDescription>
                  By default, the product status is &quot;draft&quot;.
                </FieldDescription>
                <field.Message />
              </field.Field>
            )
          }}
        />
        <form.AppField
          name="featured"
          children={(field) => {
            const fieldId = getFieldId(field)
            return (
              <field.Label htmlFor={fieldId}>
                <field.Field orientation="horizontal">
                  <field.Checkbox id={fieldId} />
                  <FieldContent>
                    <FieldTitle>Featured product</FieldTitle>
                    <FieldDescription>
                      Featured products are displayed on the home page and in
                      priority search results.
                    </FieldDescription>
                  </FieldContent>
                </field.Field>
              </field.Label>
            )
          }}
        />
        <div className="grid grid-cols-2 gap-4">
          <form.AppField
            name="price"
            children={(field) => {
              const fieldId = getFieldId(field)
              return (
                <field.Field>
                  <field.Label htmlFor={fieldId}>Price</field.Label>
                  <field.NumberInput id={fieldId} />
                  <FieldDescription>
                    The actual price of product.
                  </FieldDescription>
                  <field.Message />
                </field.Field>
              )
            }}
          />
          <form.AppField
            name="discount_price"
            children={(field) => {
              const fieldId = getFieldId(field)
              return (
                <field.Field>
                  <field.Label htmlFor={fieldId}>Discount Price</field.Label>
                  <field.NumberInput id={fieldId} />
                  <FieldDescription>
                    Discounted price after applying any promotions or coupon
                    codes.
                  </FieldDescription>
                  <field.Message />
                </field.Field>
              )
            }}
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productsListQueryKey() })
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productsListQueryKey() })
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
