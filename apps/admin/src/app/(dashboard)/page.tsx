"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";

import { categoriesApi } from "@/lib/apis";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Home() {
  return (
    <div className="flex">
      <CategorySelect />
    </div>
  );
}

function CategorySelect() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          Category
          <ChevronDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <CategoryList />
      </PopoverContent>
    </Popover>
  );
}

function CategoryList() {
  const { data, isPending, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.categoriesList().then((res) => res.data),
  });

  return (
    <Command shouldFilter={false}>
      <CommandInput />
      <CommandList>
        <CommandGroup>
          {data?.results.map((item) => (
            <CommandItem key={item.id}>{item.name}</CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
