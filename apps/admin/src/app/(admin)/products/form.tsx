import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { schemas } from "@workspace/api-client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as React from "react"
import {
  getBrandsQueryOptions,
  getCategoriesQueryOptions,
  queryKeys,
} from "@/lib/query-options"
import z from "zod"
import { apiClient } from "@/lib/api-client"
import { statusOptions } from "./columns"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { IconLoader, IconSparkles, IconTextScan2 } from "@tabler/icons-react"
import { formOptions } from "@tanstack/react-form"
import { useAppForm, withForm } from "@/hooks/form"
import { ComboboxQueryOnOpenById } from "@/components/combobox"

const formSchema = schemas.Product.extend({
  imageFile: z.instanceof(File).nullish(),
})

const defaultProduct: typeof formSchema._type = {
  id: 0,
  name: "",
  category: null,
  brand: null,
  created_at: new Date().toISOString(),
}

const productFormOpts = formOptions({
  defaultValues: defaultProduct,
  validators: {
    onSubmit: formSchema,
  },
})

export function useProductForm({
  item: itemProp,
  setOpen,
}: {
  item?: typeof schemas.Product._type
  setOpen: (open: false) => void
}) {
  const item = itemProp ? { ...itemProp, image: null } : undefined
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    mutationFn: (values: typeof formSchema._type) => {
      const data = { ...values, image: values.imageFile }
      return item
        ? apiClient.products_update(data as never, {
            params: { slug: item.slug as string },
          })
        : apiClient.products_create(data as never)
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
    defaultValues: item ?? defaultProduct,
    onSubmit: ({ value }) => mutateAsync(value as never),
  })

  return form
}

export const ProductForm = withForm({
  ...productFormOpts,
  render: function Render({ form }) {
    const product = form.state.values

    return (
      <FieldGroup>
        <form.Field
          name="sku"
          children={(field) => {
            const fieldId = `${form.formId}-${field.name}`
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={fieldId}>SKU</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    id={fieldId}
                    name={field.name}
                    value={(field.state.value as string) ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                  />
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
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Field
          name="name"
          children={(field) => {
            const fieldId = `${form.formId}-${field.name}`
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={fieldId}>Name</FieldLabel>
                <Input
                  id={fieldId}
                  name={field.name}
                  value={field.state.value as string}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  required
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Field
          name="description"
          children={(field) => {
            const fieldId = `${form.formId}-${field.name}`
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={fieldId}>Description</FieldLabel>
                <Textarea
                  id={fieldId}
                  name={field.name}
                  value={(field.state.value as string) ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Describe your product in detail: features, materials, dimensions, and any other relevant information..."
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Field
          name="imageFile"
          children={(field) => {
            const fieldId = `${form.formId}-${field.name}`
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={fieldId}>Image</FieldLabel>
                <Input
                  type="file"
                  id={fieldId}
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.files?.item(0))}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Field
          name="category_id"
          children={(field) => {
            const fieldId = `${form.formId}-${field.name}`
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={fieldId}>Category</FieldLabel>
                <ComboboxQueryOnOpenById
                  value={field.state.value as number}
                  onValueChange={field.handleChange}
                  initialItem={product.category}
                  itemsQueryOptions={getCategoriesQueryOptions()}
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
                </ComboboxQueryOnOpenById>
                <FieldDescription>
                  The category allows you to group products.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Field
          name="brand_id"
          children={(field) => {
            const fieldId = `${form.formId}-${field.name}`
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={fieldId}>Brand</FieldLabel>
                <ComboboxQueryOnOpenById
                  value={field.state.value as number}
                  onValueChange={field.handleChange}
                  itemsQueryOptions={getBrandsQueryOptions()}
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
                </ComboboxQueryOnOpenById>
                <FieldDescription>
                  The product&apos;s brand can be inferred from its name.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Field
          name="status"
          children={(field) => {
            const fieldId = `${form.formId}-${field.name}`
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={fieldId}>Status</FieldLabel>
                <Select
                  value={field.state.value as string}
                  onValueChange={field.handleChange}
                >
                  <SelectTrigger
                    id={fieldId}
                    aria-invalid={isInvalid}
                    className="w-full"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.icon} {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  By default, the product status is &quot;draft&quot;.
                </FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <form.Field
          name="featured"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            const fieldId = `${form.formId}-${field.name}`
            return (
              <FieldLabel htmlFor={fieldId} data-invalid={isInvalid}>
                <Field orientation="horizontal">
                  <Checkbox
                    id={fieldId}
                    aria-invalid={isInvalid}
                    checked={field.state.value as never}
                    onBlur={field.handleBlur}
                    onCheckedChange={field.handleChange}
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
          <form.Field
            name="price"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              const fieldId = `${form.formId}-${field.name}`
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={fieldId}>Price</FieldLabel>
                  <Input
                    type="number"
                    id={fieldId}
                    name={field.name}
                    value={(field.state.value as string) ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const value = e.target.value
                      field.handleChange(value ? Number(e.target.value) : null)
                    }}
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription>
                    The actual price of product.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
          <form.Field
            name="discount_price"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              const fieldId = `${form.formId}-${field.name}`
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={fieldId}>Discount Price</FieldLabel>
                  <Input
                    type="number"
                    id={fieldId}
                    name={field.name}
                    value={(field.state.value as string) ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const value = e.target.value
                      field.handleChange(value ? Number(e.target.value) : null)
                    }}
                    aria-invalid={isInvalid}
                  />
                  <FieldDescription>
                    Discounted price after applying any promotions or coupon
                    codes.
                  </FieldDescription>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              )
            }}
          />
        </div>
      </FieldGroup>
    )
  },
})

function GenerateSKUButton({
  product,
  onSuccess,
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
    <InputGroupButton onClick={() => mutate()} {...props}>
      {isPending ? <IconLoader className="animate-spin" /> : <IconSparkles />}
    </InputGroupButton>
  )
}

function DetectAndAssignBrandButton({
  product,
  onSuccess,
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
    <InputGroupButton onClick={() => mutate()} {...props}>
      {isPending ? <IconLoader className="animate-spin" /> : <IconTextScan2 />}
    </InputGroupButton>
  )
}
