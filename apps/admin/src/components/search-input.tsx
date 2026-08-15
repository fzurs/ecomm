"use client"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group"
import { SearchIcon } from "lucide-react"

export function SearchInput({
  className,
  children,
  ...props
}: React.ComponentProps<typeof InputGroupInput>) {
  return (
    <InputGroup className={className}>
      <InputGroupInput type="search" inputMode="search" {...props} />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      {children}
    </InputGroup>
  )
}
