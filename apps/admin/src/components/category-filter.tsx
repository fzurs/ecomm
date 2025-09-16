"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronsUpDown } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";

import * as React from "react";

import { Category } from "@workspace/api-client";

import { getCategoryQueryOptionsOnce } from "@/lib/queries";

import { CategoryList } from "./category-select";
import { Button } from "./ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

export function useCategorySearchParams() {
  return useQueryState("category", parseAsInteger);
}

export function CategoryFilter() {
  const [open, setOpen] = React.useState(false);
  const [selectedCategory, setSelectedCategory] =
    React.useState<Category | null>(null);

  const [categoryId, setCategoryId] = useCategorySearchParams();

  const { data } = useQuery(
    getCategoryQueryOptionsOnce(categoryId, selectedCategory),
  );

  React.useEffect(() => {
    if (data) {
      setSelectedCategory(data);
    }
    if (!categoryId) {
      setSelectedCategory(null);
    }
  }, [data, categoryId]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between">
          {selectedCategory?.name ?? "Category"}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0">
        <CategoryList
          selectedCategory={selectedCategory}
          setSelectedCategory={(category) => {
            setSelectedCategory(category);
            setCategoryId(category?.id ?? null);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
