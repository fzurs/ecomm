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
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
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
import { cn } from "@workspace/ui/lib/utils"
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
import { useQueryOnOpen } from "@/hooks/use-query-on-open"
import { useForm } from "@tanstack/react-form"

export function useProductForm({
  item,
  setOpen,
}: {
  item?: z.infer<typeof schemas.Product>
  setOpen: (open: boolean) => void
}) {
  const queryClient = useQueryClient()

  const { mutateAsync } = useMutation({
    mutationFn: (data: z.infer<typeof schemas.Product>) =>
      item
        ? apiClient.products_update(data, {
            params: { slug: item.slug as string },
          })
        : apiClient.products_create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() })
      setOpen(false)
    },
  })

  const form = useForm({
    formId: (item ? `update-${item.id}` : "create") + "-product-form",
    defaultValues: item ?? {
      id: 0,
      name: "",
      category: null,
      brand: null,
      created_at: new Date().toISOString(),
    },
    validators: { onSubmit: schemas.Product },
    onSubmit: ({ value }) => mutateAsync(value),
  })

  return form
}

export function ProductForm({
  form,
  className,
  ...props
}: React.ComponentProps<"form"> & {
  form: ReturnType<typeof useProductForm>
}) {
  return (
    <form
      id={form.formId}
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className={cn("px-4", className)}
      {...props}
    >
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
                      product={form.state.values}
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
          name="category_id"
          children={(field) => {
            const fieldId = `${form.formId}-${field.name}`
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={fieldId}>Category</FieldLabel>
                <CategoryCombobox
                  initialItem={form.state.values.category}
                  value={field.state.value as number}
                  onValueChange={field.handleChange}
                />
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
                <BrandCombobox
                  initialItem={form.state.values.brand}
                  value={field.state.value as number}
                  onValueChange={field.handleChange}
                  product={form.state.values}
                  form={form}
                />
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
    </form>
  )
}

function CategoryCombobox({
  initialItem: initialCategory,
  value: categoryId,
  onValueChange: setCategoryId,
}: {
  initialItem: z.infer<typeof schemas.Category> | null
  value: number | null
  onValueChange: (id: number | null) => void
}) {
  const [{ data: items }, { open, setOpen }] = useQueryOnOpen(
    getCategoriesQueryOptions()
  )

  const selectedItem =
    items?.find((item) => item.id === categoryId) ||
    (initialCategory?.id === categoryId && initialCategory) ||
    null

  return (
    <Combobox
      autoHighlight
      items={items}
      open={open}
      onOpenChange={setOpen}
      value={selectedItem}
      onValueChange={(value) => setCategoryId(value?.id ?? null)}
      itemToStringLabel={(item) => item.name}
      itemToStringValue={(item) => item.id.toString()}
      isItemEqualToValue={(itemValue, item) => itemValue.id === item.id}
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
                  <ItemDescription>{item.description}</ItemDescription>
                </ItemContent>
              </Item>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

function BrandCombobox({
  initialItem: initialBrand,
  value: brandId,
  onValueChange: setBrandId,
  product,
  form,
}: {
  initialItem: z.infer<typeof schemas.Brand> | null
  value: number
  onValueChange: (value: number | null) => void
  product: z.infer<typeof schemas.Product>
  form: ReturnType<typeof useProductForm>
}) {
  const [{ data: items }, { open, setOpen }] = useQueryOnOpen(
    getBrandsQueryOptions()
  )

  const selectedItem =
    items?.find((item) => item.id === brandId) ||
    (initialBrand?.id === brandId && initialBrand) ||
    null

  return (
    <Combobox
      autoHighlight
      items={items}
      open={open}
      onOpenChange={setOpen}
      value={selectedItem}
      onValueChange={(value) => setBrandId(value?.id ?? null)}
      itemToStringLabel={(item) => item.name}
      itemToStringValue={(item) => item.id.toString()}
      isItemEqualToValue={(itemValue, value) => itemValue.id === value.id}
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
    </Combobox>
  )
}

function GenerateSKUButton({
  product: item,
  onSuccess,
  ...props
}: React.ComponentProps<typeof InputGroupButton> & {
  product: z.infer<typeof schemas.Product>
  onSuccess: (data: z.infer<typeof schemas.Product>) => void
}) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      apiClient.products_generate_sku_create(item, {
        params: { slug: item.slug as string },
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() })
      onSuccess(data)
    },
  })

  return (
    <InputGroupButton onClick={() => mutate()} {...props}>
      {isPending ? <IconLoader className="animate-spin" /> : <IconSparkles />}
    </InputGroupButton>
  )
}

function DetectAndAssignBrandButton({
  product: item,
  onSuccess,
  ...props
}: React.ComponentProps<typeof InputGroupButton> & {
  product: z.infer<typeof schemas.Product>
  onSuccess: (data: z.infer<typeof schemas.Product>) => void
}) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      apiClient.products_detect_and_assign_brand_create(item, {
        params: { slug: item.slug as string },
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() })
      onSuccess(data)
    },
  })

  return (
    <InputGroupButton onClick={() => mutate()} {...props}>
      {isPending ? <IconLoader className="animate-spin" /> : <IconTextScan2 />}
    </InputGroupButton>
  )
}
