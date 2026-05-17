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
import { SubmitHandler, UseFormReturn } from "react-hook-form"
import { Input } from "@workspace/ui/components/input"
import * as React from "react"
import { cn } from "@workspace/ui/lib/utils"
import { schemas } from "@workspace/api-client"
import { getCategoriesQueryOptions } from "@/lib/query-options"
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
                <FormDescription />
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
                  <SelectTrigger className="w-full max-w-48">
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
            </FormItem>
          )}
        />
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
                    value={field.value ?? undefined}
                    onChange={(e) => {
                      const value = e.target.value
                      const numberValue = value ? Number(value) : undefined
                      field.onChange(numberValue)
                    }}
                  />
                </FormControl>
                <FormDescription>Price of product in dollars</FormDescription>
                <FormMessage />
              </FormItem>
            )
          }}
        />
        {children}
      </form>
    </Form>
  )
}
