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
  ComboboxValue,
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
import { useForm } from "@tanstack/react-form"
import { statusOptions } from "./columns"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { IconLoader, IconSparkles, IconTextScan2 } from "@tabler/icons-react"
import { useQueryOnOpen } from "@/hooks/use-query-on-open"

function ComboboxInputValue({
  items,
  initialItem,
  ...props
}: React.ComponentProps<typeof ComboboxInput> & {
  items?: { id: number; name: string }[]
  initialItem?: { id: number; name: string } | null
}) {
  return (
    <ComboboxValue>
      {(value) => {
        const item =
          items?.find((item) => item.id === value) ||
          (initialItem && value === initialItem.id && initialItem) ||
          undefined
        return <ComboboxInput value={item?.name ?? ""} showClear {...props} />
      }}
    </ComboboxValue>
  )
}

function CategoryCombobox({
  initialItem,
  ...props
}: React.ComponentProps<
  typeof Combobox<z.infer<typeof schemas.Category>["id"], false>
> & {
  initialItem?: z.infer<typeof schemas.Category> | null
}) {
  const [{ data: items }, { open, setOpen }] = useQueryOnOpen(
    getCategoriesQueryOptions()
  )

  return (
    <Combobox
      autoHighlight
      items={items}
      open={open}
      onOpenChange={setOpen}
      {...props}
    >
      <ComboboxInputValue
        items={items}
        initialItem={initialItem}
        placeholder="Assing a category"
      />
      <ComboboxContent>
        <ComboboxEmpty>No categories found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.id} value={item.id}>
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

function DetectAndAssignBrandInputGroupButton({
  product,
  form,
}: Omit<React.ComponentProps<typeof InputGroupButton>, "form"> & {
  product: z.infer<typeof schemas.Product>
  form: ReturnType<typeof useProductForm>
}) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      apiClient.products_detect_and_assign_brand_create(product, {
        params: { slug: product.slug as string },
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() })
      form.reset(data)
    },
  })

  return (
    <InputGroupButton onClick={() => mutate()}>
      {isPending ? <IconLoader className="animate-spin" /> : <IconTextScan2 />}
    </InputGroupButton>
  )
}

function BrandCombobox({
  product,
  form,
  ...props
}: Omit<
  React.ComponentProps<
    typeof Combobox<z.infer<typeof schemas.Brand>["id"] | null, false>
  >,
  "form"
> & {
  product: z.infer<typeof schemas.Product>
  form: ReturnType<typeof useProductForm>
}) {
  const [{ data: items }, { open, setOpen }] = useQueryOnOpen(
    getBrandsQueryOptions()
  )

  return (
    <Combobox
      autoHighlight
      items={items}
      open={open}
      onOpenChange={setOpen}
      {...props}
    >
      <ComboboxInputValue
        items={items}
        initialItem={product.brand}
        placeholder="Assing a brand"
        showTrigger={false}
      >
        <InputGroupAddon align="inline-end">
          <DetectAndAssignBrandInputGroupButton product={product} form={form} />
        </InputGroupAddon>
      </ComboboxInputValue>
      <ComboboxContent>
        <ComboboxEmpty>No brands found.</ComboboxEmpty>
        <ComboboxList>
          {(item) => (
            <ComboboxItem key={item.id} value={item.id}>
              {item.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

function SKUInput({
  item,
  form,
  ...props
}: Omit<React.ComponentProps<typeof InputGroupInput>, "form"> & {
  item: z.infer<typeof schemas.Product>
  form: ReturnType<typeof useProductForm>
}) {
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      apiClient.products_generate_sku_create(item, {
        params: { slug: item.slug as string },
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products.all() })
      form.reset(data)
    },
  })

  return (
    <InputGroup>
      <InputGroupInput {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton onClick={() => mutate()}>
          {isPending ? (
            <IconLoader className="animate-spin" />
          ) : (
            <IconSparkles />
          )}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

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
                <SKUInput
                  id={fieldId}
                  name={field.name}
                  value={(field.state.value as string) ?? ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  item={form.state.values}
                  form={form}
                />
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
                  id={fieldId}
                  name={field.name}
                  initialItem={form.state.values.category}
                  value={(field.state.value as number) ?? null}
                  onValueChange={(value) => {
                    field.handleChange(value)
                    console.log(value)
                  }}
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
                  id={fieldId}
                  name={field.name}
                  value={(field.state.value as never) || null}
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
      </FieldGroup>
    </form>
  )
}
