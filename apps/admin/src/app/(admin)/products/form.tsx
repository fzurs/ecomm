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
import { schemas } from "@workspace/api-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as React from "react"
import {
  getBrandsAllQueryOptions,
  getCategoriesAllQueryOptions,
  queryKeys,
} from "@/lib/query-options"
import z from "zod"
import { apiClient } from "@/lib/api-client"
import { ProductImagePreview, statusOptions } from "./columns"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@workspace/ui/components/input-group"
import { IconLoader, IconSparkles, IconTextScan2 } from "@tabler/icons-react"
import { formOptions } from "@tanstack/react-form"
import { useAppForm, withForm } from "@/hooks/form"
import { getFieldId } from "@/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar"

const formSchema = schemas.Product.extend({
  imageFile: z.instanceof(File).nullish(),
  clearImage: z.boolean().nullish(),
})

const defaultProduct: z.infer<typeof schemas.Product> = {
  id: 0,
  name: "",
  category: null,
  brand: null,
  created_at: new Date().toISOString(),
  discount_price: null,
}

const defaultValues: z.infer<typeof formSchema> = defaultProduct

const productFormOpts = formOptions({
  defaultValues: defaultValues,
  validators: { onSubmit: formSchema },
})

export function useProductForm({
  item,
  setOpen,
}: {
  item?: z.infer<typeof schemas.Product>
  setOpen: (open: false) => void
}) {
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    mutationFn: ({
      imageFile,
      clearImage,
      ...values
    }: z.infer<typeof formSchema>) => {
      const data = {
        ...values,
        image: (imageFile as never) ?? (clearImage ? "" : null),
      }

      return item
        ? apiClient.products_update(data, {
            params: { slug: item.slug as string },
            headers: { "Content-Type": "multipart/form-data" },
          })
        : apiClient.products_create(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() })
      setOpen(false)
    },
  })

  const form = useAppForm({
    ...productFormOpts,
    formId: item
      ? `update-product-form-${item.slug ?? item.id}`
      : "create-product-form",
    defaultValues: item ?? defaultValues,
    onSubmit: ({ value }) => mutateAsync(value),
  })

  return form
}

export const ProductForm = withForm({
  ...productFormOpts,
  props: { variant: "full" } as { variant?: "full" | "required" } | undefined,
  render: function Render({ form, variant = "full" }) {
    const product = form.state.values

    const nameField = (
      <form.AppField
        name="name"
        children={(field) => {
          const fieldId = getFieldId(form, field)
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
            const fieldId = getFieldId(form, field)
            return (
              <field.Field>
                <field.Label htmlFor={fieldId}>SKU</field.Label>
                <InputGroup>
                  <field.InputGroupInput id={fieldId} />
                  <InputGroupAddon align="inline-end">
                    <GenerateSKUButton
                      product={product}
                      onSuccess={form.reset}
                    />
                  </InputGroupAddon>
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
            const fieldId = getFieldId(form, field)
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
              const fieldId = getFieldId(form, field)
              return (
                <field.Field orientation="horizontal">
                  <field.Checkbox id={fieldId} />
                  <field.Label className="font-normal">
                    Clear product image
                  </field.Label>
                </field.Field>
              )
            }}
          />
          <form.AppField
            name="imageFile"
            children={(field) => {
              const fieldId = getFieldId(form, field)
              return (
                <field.Field>
                  <field.ImageInput id={fieldId} />
                  <field.Message />
                </field.Field>
              )
            }}
          />
        </FieldGroup>
        <form.AppField
          name="category_id"
          children={(field) => {
            const fieldId = getFieldId(form, field)
            return (
              <field.Field>
                <field.Label htmlFor={fieldId}>Category</field.Label>
                <field.ComboboxQueryOnOpenById
                  initialItem={product.category}
                  itemsQueryOptions={getCategoriesAllQueryOptions}
                >
                  <ComboboxInput placeholder="Assing a category" />
                  <ComboboxContent>
                    <ComboboxEmpty>No categories found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item: z.infer<typeof schemas.Category>) => (
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
            const fieldId = getFieldId(form, field)
            return (
              <field.Field>
                <field.Label htmlFor={fieldId}>Brand</field.Label>
                <field.ComboboxQueryOnOpenById
                  itemsQueryOptions={getBrandsAllQueryOptions}
                  initialItem={product.brand}
                >
                  <ComboboxInput placeholder="Assing a brand">
                    <InputGroupAddon align="inline-end">
                      <DetectAndAssignBrandButton
                        product={product}
                        onSuccess={form.reset}
                      />
                    </InputGroupAddon>
                  </ComboboxInput>
                  <ComboboxContent>
                    <ComboboxEmpty>No brands found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item: z.infer<typeof schemas.Brand>) => (
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
            const fieldId = getFieldId(form, field)
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
            const fieldId = getFieldId(form, field)
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
              const fieldId = getFieldId(form, field)
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
              const fieldId = getFieldId(form, field)
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
  onSuccess,
  size = "icon-xs",
  ...props
}: React.ComponentProps<typeof InputGroupButton> & {
  product: typeof schemas.Product._type
  onSuccess?: (data: typeof schemas.Product._type) => void
}) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      apiClient.products_generate_sku_create(product, {
        params: { slug: product.slug as string },
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() })
      onSuccess?.(data)
    },
  })

  return (
    <InputGroupButton onClick={() => mutate()} size={size} {...props}>
      {isPending ? <IconLoader className="animate-spin" /> : <IconSparkles />}
    </InputGroupButton>
  )
}

function DetectAndAssignBrandButton({
  product,
  onSuccess,
  size = "icon-xs",
  ...props
}: React.ComponentProps<typeof InputGroupButton> & {
  product: typeof schemas.Product._type
  onSuccess?: (data: typeof schemas.Product._type) => void
}) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      apiClient.products_detect_and_assign_brand_create(product, {
        params: { slug: product.slug as string },
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() })
      onSuccess?.(data)
    },
  })

  return (
    <InputGroupButton onClick={() => mutate()} size={size} {...props}>
      {isPending ? <IconLoader className="animate-spin" /> : <IconTextScan2 />}
    </InputGroupButton>
  )
}
