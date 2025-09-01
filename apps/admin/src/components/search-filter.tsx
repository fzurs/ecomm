import { useEffect } from "react";
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "@/components/ui/input";
import { parseAsString, useQueryState } from "nuqs";
import { cn } from "@/lib/utils";

export function useSearch() {
  return useQueryState("search", parseAsString.withDefault(""));
}

export function SearchFilter({
  debounceMs = 300,
  className,
  placeholder = "Search...",
  ...props
}: React.ComponentProps<"input"> & { debounceMs?: number }) {
  const [search, setSearch] = useSearch();

  // internal value
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setInputValue(search);
  }, [search]);

  const debouncedSetValue = useDebouncedCallback(setSearch, debounceMs);

  return (
    <Input
      type="search"
      className={cn("max-w-[300px]", className)}
      value={inputValue}
      onChange={(e) => {
        const value = e.target.value;
        setInputValue(value);
        debouncedSetValue(value);
      }}
      placeholder={placeholder}
      {...props}
    />
  );
}
