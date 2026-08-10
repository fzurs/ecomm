"use client"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@workspace/ui/components/input-group"
import { SearchIcon } from "lucide-react"

export function SearchInput({
  onValueChange,
  onChange,
  count,
  className,
  ...props
}: React.ComponentProps<typeof InputGroupInput> & {
  onValueChange?: (value: string) => void
  count?: number
}) {
  return (
    <InputGroup className={className}>
      <InputGroupInput
        type="search"
        inputMode="search"
        onChange={(e) => {
          onChange?.(e)
          onValueChange?.(e.target.value)
        }}
        {...props}
      />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupAddon align="inline-end">
        <InputGroupText>{count} results</InputGroupText>
      </InputGroupAddon>
    </InputGroup>
  )
}
