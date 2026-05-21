"use client"

import z from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form"
import { Controller, SubmitHandler, UseFormReturn } from "react-hook-form"
import { Input } from "@workspace/ui/components/input"
import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { schemas } from "@workspace/api-client"
import {
  getBrandsQueryOptions,
  getCategoriesQueryOptions,
} from "@/lib/query-options"
import { snakeCaseToTitle } from "@/lib/utils"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Combobox,
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
import { useQuery } from "@tanstack/react-query"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@workspace/ui/components/field"

export function ProductForm({
  form,
  children,
  onSubmit,
  className,
  ...props
}: Omit<React.ComponentProps<"form">, "onSubmit"> & {
  form: UseFormReturn<z.infer<typeof schemas.Product>>
  onSubmit: SubmitHandler<z.infer<typeof schemas.Product>>
}) {
  return (
    <Form {...form}>
      <form
        className={cn("space-y-4", className)}
        onSubmit={form.handleSubmit(onSubmit)}
        {...props}
      >
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea value={field.value ?? ""} onChange={field.onChange} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category_id"
          render={function Render({ field }) {
            const [open, setOpen] = React.useState(false)
            const [value, setValue] = React.useState(form.getValues().category)

            const { data: categories } = useQuery({
              ...getCategoriesQueryOptions(),
              enabled: open,
            })

            return (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Combobox
                  autoHighlight
                  items={categories}
                  itemToStringValue={(item) => item.id.toString()}
                  itemToStringLabel={(item) => item.name}
                  isItemEqualToValue={(a, b) => a.id === b.id}
                  value={value}
                  onValueChange={(v) => {
                    setValue(v)
                    field.onChange(v?.id || null)
                  }}
                  open={open}
                  onOpenChange={setOpen}
                >
                  <ComboboxInput placeholder="Assing a item" showClear />
                  <ComboboxContent>
                    <ComboboxEmpty>No categories found.</ComboboxEmpty>
                    <ComboboxList>
                      {(category: z.infer<typeof schemas.Category>) => (
                        <ComboboxItem key={category.id} value={category}>
                          <Item size="sm" className="p-0">
                            <ItemContent>
                              <ItemTitle>{category.name}</ItemTitle>
                              <ItemDescription>
                                {category.description}
                              </ItemDescription>
                            </ItemContent>
                          </Item>
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <FormDescription>
                  The category allows you to group products
                </FormDescription>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          control={form.control}
          name="brand_id"
          render={function Render({ field }) {
            const [open, setOpen] = React.useState(false)
            const [value, setValue] = React.useState(form.getValues().brand)

            const { data: brands } = useQuery({
              ...getBrandsQueryOptions(),
              enabled: open,
            })

            return (
              <FormItem>
                <FormLabel>Brand</FormLabel>
                <Combobox
                  autoHighlight
                  items={brands}
                  itemToStringValue={(item) => item.id.toString()}
                  itemToStringLabel={(item) => item.name}
                  isItemEqualToValue={(a, b) => a.id === b.id}
                  value={value}
                  onValueChange={(v) => {
                    setValue(v)
                    field.onChange(v?.id || null)
                  }}
                  open={open}
                  onOpenChange={setOpen}
                >
                  <ComboboxInput
                    placeholder="Do you change the brand of product..."
                    showClear
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>No brands found.</ComboboxEmpty>
                    <ComboboxList>
                      {(item: NonNullable<typeof value>) => (
                        <ComboboxItem key={item.id} value={item}>
                          {item.name}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <FormDescription>
                  The product&apos;s brand can be inferred from its name
                </FormDescription>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        <FormField
          name="status"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status of product..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {schemas.StatusEnum.options.map((status) => (
                      <SelectItem key={status} value={status}>
                        {snakeCaseToTitle(status)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormDescription>
                By default, the product status is &quot;draft&quot;
              </FormDescription>
            </FormItem>
          )}
        />
        <Controller
          name="featured"
          control={form.control}
          render={({ field: { value, onChange, ...props } }) => (
            <FieldLabel>
              <Field orientation="horizontal">
                <Checkbox
                  {...props}
                  checked={value}
                  onCheckedChange={onChange}
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
          )}
        />
        <div className="flex items-start gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    The actual price of the product
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
          <FormField
            control={form.control}
            name="discount_price"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Discount Price</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
        </div>
        {children}
      </form>
    </Form>
  )
}
