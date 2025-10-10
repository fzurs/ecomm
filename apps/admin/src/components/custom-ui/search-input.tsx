import { SearchIcon } from "lucide-react";

import * as React from "react";

import { cn } from "@/lib/utils";

import { DebouncedInput } from "./debounced-input";

function SearchInput({
  className,
  type = "search",
  placeholder = "Search...",
  ...props
}: React.ComponentProps<typeof DebouncedInput>) {
  return (
    <div className="relative flex w-full">
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <DebouncedInput
        type={type}
        placeholder={placeholder}
        className={cn("pl-10", className)}
        {...props}
      />
    </div>
  );
}

export { SearchInput };
