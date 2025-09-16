"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  ArchiveX,
  CheckCircle,
  CircleDotDashed,
  FilePenLine,
  PackageX,
  PauseCircle,
} from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";

import * as React from "react";

import { Brand, Category, Product } from "@workspace/api-client";
import { ProductStatusEnum } from "@workspace/api-client";

import {
  getBrandsInfiniteQueryOptions,
  getCategoriesInfiniteQueryOptions,
} from "@/lib/queries";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const statusConfig: Record<
  ProductStatusEnum,
  {
    label: string;
    icon?: React.JSX.Element;
  }
> = {
  active: {
    label: "Active",
    icon: (
      <CheckCircle className="fill-green-500 dark:fill-green-400 text-background" />
    ),
  },
  discontinued: {
    label: "Discontinued",
    icon: (
      <ArchiveX className="fill-red-500 dark:fill-red-400 text-background" />
    ),
  },
  draft: {
    label: "Draft",
    icon: (
      <FilePenLine className="fill-blue-500 dark:fill-blue-400 text-background" />
    ),
  },
  inactive: {
    label: "Inactive",
    icon: (
      <PauseCircle className="fill-gray-400 dark:fill-gray-500 text-background" />
    ),
  },
  out_of_stock: {
    label: "Out of stock",
    icon: (
      <PackageX className="fill-yellow-500 dark:fill-yellow-400 text-background" />
    ),
  },
};

export const statusOptions = Object.values(ProductStatusEnum).map((value) => ({
  label: statusConfig[value].label,
  value,
  icon: statusConfig[value].icon,
}));

export function ProductForm({
  form,
  className,
  ...props
}: {
  form: UseFormReturn<Product>;
} & React.ComponentProps<"form">) {
  return (
    <Form {...form}>
      <form className={cn("grid gap-4", className)} {...props}>
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
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
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
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU</FormLabel>
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
                <Textarea {...field} />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <CategorySelect />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="brand_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <FormControl>
                <BrandSelect
                  original={form.getValues().brand}
                  onBrandIdChange={field.onChange}
                />
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
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
            name="stock_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormDescription />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.icon}
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription />
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

export function CategoryList({
  selectedCategory,
  onCategorySelect,
}: {
  selectedCategory: Category | null;
  onCategorySelect: (category: Category | null) => void;
}) {
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const debouncedSetSearch = useDebouncedCallback(setSearch, 300);

  const { data, hasNextPage, fetchNextPage } = useInfiniteQuery(
    getCategoriesInfiniteQueryOptions({
      limit: 10,
      search,
    }),
  );

  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search for a category..."
        value={searchInput}
        onValueChange={(value) => {
          setSearchInput(value);
          debouncedSetSearch(value);
        }}
      />
      <CommandList
        onScroll={(e) => {
          const target = e.currentTarget;
          if (
            hasNextPage &&
            target.scrollTop + target.clientHeight >= target.scrollHeight
          ) {
            fetchNextPage();
          }
        }}
      >
        <CommandEmpty>No category found.</CommandEmpty>
        <CommandGroup>
          {data?.pages
            .flatMap((page) => page.results)
            ?.map((category) => (
              <CommandItem
                key={category.id}
                onSelect={() =>
                  onCategorySelect(
                    selectedCategory?.id !== category.id ? category : null,
                  )
                }
              >
                {category.name}
                <Check
                  className={cn(
                    "ml-auto",
                    selectedCategory?.id === category.id
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function CategorySelect({
  original,
  onCategoryIdChange,
}: {
  original?: Category | null;
  onCategoryIdChange?: (id?: number) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const [selectedCategory, setSelectedCategory] =
    React.useState<Category | null>(original ?? null);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between">
          {selectedCategory?.name ?? "Assign a category"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <CategoryList
          selectedCategory={selectedCategory}
          onCategorySelect={(category) => {
            setSelectedCategory(category);
            onCategoryIdChange?.(category?.id);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

export function BrandList({
  selectedBrand,
  onBrandSelect,
}: {
  selectedBrand: Brand | null;
  onBrandSelect: (brand: Brand | null) => void;
}) {
  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const debouncedSetSearch = useDebouncedCallback(setSearch, 300);

  const { data, hasNextPage, fetchNextPage } = useInfiniteQuery(
    getBrandsInfiniteQueryOptions({
      limit: 10,
      search,
    }),
  );

  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder="Search for a brand..."
        value={searchInput}
        onValueChange={(value) => {
          setSearchInput(value);
          debouncedSetSearch(value);
        }}
      />
      <CommandList
        onScroll={(e) => {
          const target = e.currentTarget;
          if (
            hasNextPage &&
            target.scrollTop + target.clientHeight >= target.scrollHeight
          ) {
            fetchNextPage();
          }
        }}
      >
        <CommandEmpty>No brand found.</CommandEmpty>
        <CommandGroup>
          {data?.pages
            .flatMap((page) => page.results)
            ?.map((brand) => (
              <CommandItem
                key={brand.id}
                onSelect={() =>
                  onBrandSelect(selectedBrand?.id !== brand.id ? brand : null)
                }
              >
                {brand.name}
                <Check
                  className={cn(
                    "ml-auto",
                    selectedBrand?.id === brand.id
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

export function BrandSelect({
  original,
  onBrandIdChange,
}: {
  original?: Brand | null;
  onBrandIdChange?: (id?: number) => void;
}) {
  const [open, setOpen] = React.useState(false);

  const [selectedBrand, setSelectedBrand] = React.useState<Brand | null>(
    original ?? null,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between">
          {selectedBrand?.name ?? "Assign a brand"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <BrandList
          selectedBrand={selectedBrand}
          onBrandSelect={(brand) => {
            setSelectedBrand(brand);
            onBrandIdChange?.(brand?.id);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
