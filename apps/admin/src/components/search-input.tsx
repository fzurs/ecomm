"use client"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@workspace/ui/components/input-group"
import { cn } from "cn"
import { SearchIcon } from "lucide-react"

/**
 * Search box for the list pages. While there is a search term, it shows
 * `count` (the API's total, not just the current page) as the number of
 * results found.
 */
export function SearchInput({
  className,
  value,
  onValueChange,
  count,
  ...props
}: Omit<
  React.ComponentProps<typeof InputGroupInput>,
  "value" | "onChange" | "type"
> & {
  value: string
  onValueChange: (value: string) => void
  count?: number
}) {
  const showCount = value !== "" && count !== undefined

  // h-8, like the size="sm" buttons of DataTableAdvancedToolbar.
  return (
    <InputGroup className={cn("h-8", className)}>
      <InputGroupInput
        type="search"
        inputMode="search"
        className="[&::-webkit-search-cancel-button]:appearance-none"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        {...props}
      />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      {showCount && (
        <InputGroupAddon align="inline-end">
          <InputGroupText aria-live="polite" className="tabular-nums">
            {count} {count === 1 ? "result" : "results"}
          </InputGroupText>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
